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


    Model.transaction(async trx => {
      const payload = req.body;
      const { transaction_status, transaction_id } = payload;
  
      // paid
      if (transaction_status == "settlement") {
        // edit payment status on db
        const token = "MXM23-" + randomToken(32);
        const updateTransactionStatus = await MalpunTransaction.query()
          .where({
            id: "8ij3txnc9b5w5bikn7ufd05e58pwfcn1",
          })
          .update({
            status: "settlement",
          });
        // on external table, update ticketBuyed to 1
        const external = await External.query()
          .where({
            transactionID: "8ij3txnc9b5w5bikn7ufd05e58pwfcn1",
          })
          .update({
            ticketBuyed: true,
            token : token
          });
        // send email to user (according to token)


        const externalAccount = await External.query()
          .join('malpun_transaction', 'malpun_transaction.id', '=', 'external.transactionID')
          .where({
            transactionID: "8ij3txnc9b5w5bikn7ufd05e58pwfcn1",
          })
          .first() || {};
 

        let qrCodeImage = await QRCode.toDataURL(token);

        const htmlBody = `
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #ffffff;
              text-align: center;
              margin: 0;
              padding: 0;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .body-text {
              font-size: 16px;
              margin-bottom: 20px;
            }
            .qr-code {
              display: block;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Malpun Ticket</div>
            <div class="body-text">
              Berikut adalah barcode tiket kamu. Tunjukkan barcode ini kepada panitia di hari-H.
              Jangan lupa datang ya di tanggal 7 Oktober.
            </div>
            <img class="qr-code" src="${qrCodeImage}" alt="QR Code" width="300" height="300"/>
          </div>
        </body>
        </html>
      `;

      const subject = "MAXIMA 2023 - Klaim Tiket Malam Puncak";
      const emailData = {
        from : process.env.MAIL_ACCOUNT, 
        to : externalAccount?.email || "", 
        subject, 
        attachDataUrls : true,
        html : htmlBody
      }



      sendGridClient
      .send(emailData)
      .then((response) => {
        console.log("SUCCESS");
        return res.status(200).json({
          status: "SUCCESS",
          type: "PAYMENT_SETTLEMENT",
          code: 200,
          message: "Pembayaran berhasil dilakukan. Silahkan cek email untuk mengklaim tiket.",
        }, error => {
          console.error(error)

          if (error.response){
            console.log("NODMAILER");
            mailConfig.sendMail(
              emailData,
              (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).send({
                    code: 500,
                    message: err.message,
                  });
                }
                return res.status(200).json({
                  status: "SUCCESS",
                  type: "PAYMENT_SETTLEMENT",
                  code: 200,
                  message: "Pembayaran berhasil dilakukan. Silahkan cek email untuk mengklaim tiket.",
                });
              }
            );
          }

        });
      })        
    
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
            id: "8ij3txnc9b5w5bikn7ufd05e58pwfcn1",
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
    }).catch(err => {
      console.error(err);
      return res.status(500).send({
        code: 500,
        message: err.message,
      });
    })


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
