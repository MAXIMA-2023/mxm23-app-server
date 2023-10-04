const env = require("dotenv").config({ path: "../../.env" });
const External = require("../../malpun/model/external.model");
const MalpunTransaction = require("../../malpun/model/malpun_transaction.model");
const randomToken = require("random-token");
const { Model } = require("objection");
const { midtransCore, midtransSnap } = require("../../config/midtrans");
const sendGridClient = require("../../config/sendgrid");
const mailConfig = require("../../config/mail");
const QRCode = require("qrcode");

// const tes = async (req, res) => {
//   const {name, 
//     email, 
//     transactionID,
//     token} = req.body;
//   try{
//     const emailHTML = `
//       <!DOCTYPE html>
//       <html lang="en">
//         <head>
//           <meta charset="UTF-8" />
//           <style>
//             table,
//             th,
//             td {
//               border-collapse: collapse;
//             }
//             th,
//             td {
//               padding: 0.5em;
//             }
//           </style>
//         </head>
//         <body style="width: 100%; height: 100vh; font-family: 'Nunito Sans', sans-serif; color: #062d5f; background-color: #ededed">
//           <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; padding: 3em">
//             <div style="width: 55em; min-width: 35em; max-width: auto; height: auto; text-align: center; background-color: #fff; padding: 2em; box-shadow: 0px 0px 10px rgb(0, 0, 0, 0.25); border-radius: 0.5em">
//               <div>
//                 <img src="https://storage.googleapis.com/mxm23-app-client/webps/webps/public/assets/MaximaLogoEmail.webp" alt="mxmLogo" style="width: 180px" />
//               </div>
//               <div style="margin-top: 2em; text-align: justify; line-height: 1.5em">
//                 <p style="font-size: 1.2em">
//                   <b>Halo ${name}!</b>
//                 <p>
//                   Terima kasih sudah membeli tiket untuk
//                   <b>Malam Puncak MAXIMA 2023</b>. Ini ada tiket buat kamu biar
//                   bisa nikmatin <b> Malam Puncak MAXIMA 2023</b> bersama
//                   <b>Maxi</b>, <b>Xima</b> dan teman-teman kamu!
//                 </p>
//                 <p><b>Jangan lupa baca "Do's and Dont's" dan bawa tiketnya ya</b>!</p>
//               </div>
//               <hr style="border-color: #062d5f" />
//               <div>
//                 <table style="width: 100%">
//                   <tr>
//                     <td style="text-align: left; padding-right: 1em">Nama</td>
//                     <td style="text-align: left; padding-right: 1em">Email</td>
//                     <td style="text-align: left; padding-right: 1em">Ticket Cost</td>
//                   </tr>
//                   <tr>
//                     <th style="text-align: left; padding-right: 1em">${name}</th>
//                     <th style="text-align: left; padding-right: 1em">${email}</th>
//                     <th style="text-align: left; padding-right: 1em">Rp. 35.000</th>
//                   </tr>
//                   <tr>
//                     <td style="text-align: left; padding-right: 1em">Event Date</td>
//                     <td style="text-align: left; padding-right: 1em">Event Time</td>
//                     <td style="text-align: left; padding-right: 1em">Place</td>
//                   </tr>
//                   <tr>
//                     <th style="text-align: left; padding-right: 1em">Sabtu, 7 Oktober 2023</th>
//                     <th style="text-align: left; padding-right: 1em">16:00 WIB</th>
//                     <th style="text-align: left; padding-right: 1em">Universitas Multimedia Nusantara</th>
//                   </tr>
//                 </table>
//               </div>
//               <div>
//                 <table style="width: 100%; margin-top: 5em">
//                   <tr>
//                     <td style="text-align: left; padding-right: 1em">Transaction ID</td>
//                   </tr>
//                   <tr>
//                     <th style="text-align: left; padding-right: 1em">${transactionID}</th>
//                   </tr>
//                 </table>
//               </div>
//               <div style="width: 100%; margin-top: 5em">
//                 <a href="https://maximaumn.com/malpun/tiket/${token}" style="text-decoration: none; background-color: #f7b70c; color: #fff; padding: 10px 20px; border-radius: 64px; display: inline-block">Claim Your Ticket</a>
//                 <p style="font-size: 0.8em">*Ticket ini hanya berlaku untuk 1 orang</p>
//               </div>
//               <div style="width: 100%; margin-top: 5em; text-align: left; line-height: 0.75em">
//                 <p>Jika <b>maximers</b> memiliki pertanyaan, silahkan hubungi kami di</p>
//                 <p><b></b>Instagram: <a href="https://www.instagram.com/maximaumn/" target="_blank" style="text-decoration: none; color: #062d5f">@maximaumn</a></p>
//                 <p>Line: <a href="https://line.me/R/ti/p/@vuu3203w" target="_blank" style="text-decoration: none; color: #062d5f">@maximaumn</a></p>
//                 <p>
//                   Email:
//                   <a href="mailto:maxima@umn.ac.id">maxima@umn.ac.id</a>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </body>
//       </html>
//   `;
  
//     // Define email options
//     const mailOptions = {
//       from: process.env.MAIL_ACCOUNT,
//       to: email,
//       subject: "[ Ticket To Malam Puncak MAXIMA 2023 ]",
//       attachDataUrls: true,
//       html: emailHTML,
//       attachments: [
//         {
//           filename: "Do's and Don't.pdf",
//           path: "attachment/Do's.pdf",
//           cid: "Image1",
//         }

//       ],
//     };
  
//     sendGridClient.send(mailOptions).catch((error) => {
//       mailConfig.sendMail(mailOptions);
//     });
//     return res.status(200).send({
//       code: 200,
//       message: "success",
//     });
//   }catch(err){
//     console.error(err);
//     return res.status(500).send({
//       code: 500,
//       message: err.message,
//     });
//   };
// };

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
        const token = await External.query().select("token").where({transactionID: order_id});
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
            ticketBuyed: true
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
              <style>
                table,
                th,
                td {
                  border-collapse: collapse;
                }
                th,
                td {
                  padding: 0.5em;
                }
              </style>
            </head>
            <body style="width: 100%; height: 100vh; font-family: 'Nunito Sans', sans-serif; color: #062d5f; background-color: #ededed">
              <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; padding: 3em">
                <div style="width: 55em; min-width: 35em; max-width: auto; height: auto; text-align: center; background-color: #fff; padding: 2em; box-shadow: 0px 0px 10px rgb(0, 0, 0, 0.25); border-radius: 0.5em">
                  <div>
                    <img src="https://storage.googleapis.com/mxm23-app-client/webps/webps/public/assets/MaximaLogoEmail.webp" alt="mxmLogo" style="width: 180px" />
                  </div>
                  <div style="margin-top: 2em; text-align: justify; line-height: 1.5em">
                    <p style="font-size: 1.2em">
                      <b>Halo ${externalAccount.name}!</b>
                    <p>
                      Terima kasih sudah membeli tiket untuk
                      <b>Malam Puncak MAXIMA 2023</b>. Ini ada tiket buat kamu biar
                      bisa nikmatin <b> Malam Puncak MAXIMA 2023</b> bersama
                      <b>Maxi</b>, <b>Xima</b> dan teman-teman kamu!
                    </p>
                    <p><b>Jangan lupa baca "Do's and Dont's" dan bawa tiketnya ya</b>!</p>
                  </div>
                  <hr style="border-color: #062d5f" />
                  <div>
                    <table style="width: 100%">
                      <tr>
                        <td style="text-align: left; padding-right: 1em">Nama</td>
                        <td style="text-align: left; padding-right: 1em">Email</td>
                        <td style="text-align: left; padding-right: 1em">Ticket Cost</td>
                      </tr>
                      <tr>
                        <th style="text-align: left; padding-right: 1em">${externalAccount.name}</th>
                        <th style="text-align: left; padding-right: 1em">${externalAccount.email}</th>
                        <th style="text-align: left; padding-right: 1em">Rp. 35.000</th>
                      </tr>
                      <tr>
                        <td style="text-align: left; padding-right: 1em">Event Date</td>
                        <td style="text-align: left; padding-right: 1em">Event Time</td>
                        <td style="text-align: left; padding-right: 1em">Place</td>
                      </tr>
                      <tr>
                        <th style="text-align: left; padding-right: 1em">Sabtu, 7 Oktober 2023</th>
                        <th style="text-align: left; padding-right: 1em">16:00 WIB</th>
                        <th style="text-align: left; padding-right: 1em">Universitas Multimedia Nusantara</th>
                      </tr>
                    </table>
                  </div>
                  <div>
                    <table style="width: 100%; margin-top: 5em">
                      <tr>
                        <td style="text-align: left; padding-right: 1em">Transaction ID</td>
                      </tr>
                      <tr>
                        <th style="text-align: left; padding-right: 1em">${externalAccount.transactionID}</th>
                      </tr>
                    </table>
                  </div>
                  <div style="width: 100%; margin-top: 5em">
                    <a href="https://maximaumn.com/malpun/tiket/${token}" style="text-decoration: none; background-color: #f7b70c; color: #fff; padding: 10px 20px; border-radius: 64px; display: inline-block">Claim Your Ticket</a>
                    <p style="font-size: 0.8em">*Ticket ini hanya berlaku untuk 1 orang</p>
                  </div>
                  <div style="width: 100%; margin-top: 5em; text-align: left; line-height: 0.75em">
                    <p>Jika <b>maximers</b> memiliki pertanyaan, silahkan hubungi kami di</p>
                    <p><b></b>Instagram: <a href="https://www.instagram.com/maximaumn/" target="_blank" style="text-decoration: none; color: #062d5f">@maximaumn</a></p>
                    <p>Line: <a href="https://line.me/R/ti/p/@vuu3203w" target="_blank" style="text-decoration: none; color: #062d5f">@maximaumn</a></p>
                    <p>
                      Email:
                      <a href="mailto:maxima@umn.ac.id">maxima@umn.ac.id</a>
                    </p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        // Define email options
        const mailOptions = {
          from: process.env.MAIL_ACCOUNT,
          to: externalAccount.email,
          subject: "[ Ticket To Malam Puncak MAXIMA 2023 ]",
          // attachDataUrls: true,
          html: emailHTML,
          attachments: [
            {
              filename: "Do's and Don't in Malam Puncak MAXIMA 2023.pdf",
              path: "attachment/Do's.pdf",
              cid: "aturan",
            }
          ],
        };

        sendGridClient.send(mailOptions).catch((error) => {
          mailConfig.sendMail(mailOptions);
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
  paymentCallback
  // ,tes
};
