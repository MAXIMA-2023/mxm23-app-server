const env = require("dotenv").config({ path: "../../.env" });
const External = require("../../malpun/model/external.model");
const MalpunTransaction = require("../../malpun/model/malpun_transaction.model");
const randomToken = require("random-token");
const { Model } = require("objection");
const { midtransCore, midtransSnap } = require("../../config/midtrans");
const sendGridClient = require("../../config/sendgrid");
const mailConfig = require("../../config/mail");
const QRCode = require("qrcode");

const paymentCallback = async (req, res) => {
  // wait for input alfagift ID
  // tanya ini API input alfagift sama sponsor pisah apa gabung

  try {
    Model.transaction(async (trx) => {
      const payload = req.body;
      const { transaction_status, transaction_id, order_id } = payload;
      console.log(payload);

      const transactionData = await External.query()
        .where({
          transactionID: order_id,
          ticketBuyed: true,
        })
        .first();

      if (transactionData) {
        return res.status(208).json({
          status: "SUCCESS",
          type: "PAID",
          code: 208,
          message: "Pembayaran telah dilakukan.",
        });
      }

      // paid
      if (transaction_status == "settlement") {
        // edit payment status on db
        const token = "MXM23-" + randomToken(32);
        const updateTransactionStatus = await MalpunTransaction.query()
          .where({
            id: order_id,
          })
          .update({
            status: "settlement",
          });
        // on external table, update ticketBuyed to 1
        const external = await External.query()
          .where({
            transactionID: order_id,
          })
          .update({
            ticketBuyed: true,
            token: token,
          });
        // send email to user (according to token)

        const externalAccount = await External.query()
          .join(
            "malpun_transaction",
            "malpun_transaction.id",
            "=",
            "external.transactionID"
          )
          .where({
            transactionID: order_id,
          })
          .first();

        //mail options
        const emailHTML = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
            </head>
            <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ededed; ">
              <tr>
                <td align="center" valign="middle">
                  <table width="500" cellspacing="0" cellpadding="20" border="0" style="background-color: #ffffff;min-width:auto;max-width:600px; border-radius: 0.7em; box-shadow: 0 2px 10px rgba(0.4, 0.4, 0.4, 0.4);">
                    <tr>
                      <td align="center">
                        <!-- Image -->
                        <img src="https://storage.googleapis.com/mxm23-app-client/webps/webps/public/assets/MaximaLogo_Desktop.webp" alt="mxmLogo" width="226" height="62" style="width: 226px; height: 62px;" />
                      </td>
                    </tr>
                    <tr>
                      <td style="font-family: 'Nunito Sans', sans-serif; font-size: 15px; text-align: left; text-shadow: 0 2px 10px rgba(0.4, 0.4, 0.4, 0.4); margin-left: 1em; margin-right: 1em;">
                        <!-- Text Container -->
                        <p>
                          Hi, <b>${externalAccount.name}</b>. Selamat datang di
                          <b>Malam Puncak MAXIMA 2023</b>. Ini ada ticket buat kamu biar bisa
                          nikmatin <b> Malam Puncak MAXIMA 2023</b> bersama <b>Maxi </b>dan
                          <b>Xima</b> dan teman-teman kamu!!!
                        </p>
                        <p><b>Jangan lupa ticketnya dibawa ya</b>!!!!</p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <!-- QR Code Image -->
                        <a href="https://maxima.umn.ac.id/malpun/tiket/${token}" style="text-decoration: none; background-color: #F7B70C; color: #fff; padding: 10px 20px; border-radius: 64px; display: inline-block;">Claim Your Ticket</a>

                        </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </html>
        `;

        // Define email options
        const mailOptions = {
          from: process.env.MAIL_ACCOUNT,
          to: externalAccount.email,
          subject: "Ticket To Malam Puncak",
          // attachDataUrls: true,
          html: emailHTML,
        };

        sendGridClient
          .send(mailOptions)
          .then((response) => {
            // console.log("SUCCESS");
            return res.status(200).json({
              status: "SUCCESS",
              type: "PAYMENT_SETTLEMENT",
              code: 200,
              message:
                "Pembayaran berhasil dilakukan. Silahkan cek email untuk mengklaim tiket.",
            });
          })
          .catch((error) => {
            // if (error){
            mailConfig.sendMail(mailOptions);
            return res.status(200).json({
              status: "SUCCESS",
              type: "PAYMENT_SETTLEMENT",
              code: 200,
              message:
                "Pembayaran berhasil dilakukan. Silahkan cek email untuk mengklaim tiket.",
            });
          });

        return res.status(200).json({
          status: "SUCCESS",
          type: "PAYMENT_SETTLEMENT",
          code: 200,
          message: "Pembayaran berhasil dilakukan.",
        });
      }

      // pending (user had chosen a payment method)
      if (transaction_status == "pending") {
        // edit payment status to pending
        const updateTransactionStatus = await MalpunTransaction.query()
          .where({
            id: order_id,
          })
          .update({
            status: "pending",
          });

        return res.status(200).json({
          status: "SUCCESS",
          type: "PAYMENT_PENDING",
          code: 200,
          message:
            "Pembayaran sedang dalam status pending / menunggu aksi dari user.",
        });
      }

      return res.status(200).json({
        status: "SUCCESS",
        code: 200,
        message:
          "Berhasil melakukan pemrosesan pada payment dengan status " +
          transaction_status,
      });
    }).catch((err) => {
      console.error(err);
      return res.status(500).send({
        code: 500,
        message: err.message,
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

module.exports = {
  paymentCallback,
};
