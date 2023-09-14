const nodemailer = require("nodemailer");
const Mahasiswa = require("../../user/model/mahasiswa.model");
const env = require("dotenv").config();
const QRCode = require("qrcode");

const sendEmail = async (req, res) => {
  try {
    const nimMhs = req.decoded_nim;

    const mahasiswa = await Mahasiswa.query().where({ nim: nimMhs }).first();

    //return if ticket already claimed
    if (mahasiswa.ticketClaimed) {
      return res.status(404).send({
        code: 404,
        message: "kamu sudah meng-klaim tiket, silahkan cek email kamu",
      });
    }

    //generate the qr code
    let qrCodeImage = await QRCode.toDataURL(mahasiswa.token);

    //transporter setup
    let transporter = nodemailer.createTransport({
      service: "gmail",
      // host: process.env.MAIL_HOST,
      // port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_ACCOUNT,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    //mail options
    const emailHTML = `
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

    let message = {
      from: process.env.MAIL_ACCOUNT,
      to: mahasiswa.email,
      subject: "Ticket To Malam Puncak",
      attachDataUrls: true,
      html: emailHTML,
    };
    await transporter.sendMail(message);

    const mhs = await Mahasiswa.query()
      .where({ nim: nimMhs })
      .update({ ticketClaimed: 1 })
      .first();

    // return res.status(200).send(qrCodeImage);
    return res.status(200).send({
      code: 200,
      message: "Tiket berhasil di-klaim, silahkan cek email",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
};

const updateAlphagift = async (req, res) => {
  try {
    const alfaID = req.body.alfagiftID;
    const nimMhs = req.decoded_nim;

    // validasi kalo ID lebih dari 16 character
    if (alfaID.length > 16) {
      return res.status(404).send({
        code: 404,
        message: "alfagiftID terlalu panjang",
      });
    }

    const mahasiswa = await Mahasiswa.query()
      .where({ nim: nimMhs })
      .update({ alfagiftID: alfaID })
      .first();
    if (!mahasiswa) {
      return res.status(404).send({
        code: 404,
        message: "gagal input alfagiftID",
      });
    }

    return res.status(200).send({
      code: 200,
      message: "berhasil input alfagiftID",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
};

module.exports = {
  sendEmail,
  updateAlphagift,
};
