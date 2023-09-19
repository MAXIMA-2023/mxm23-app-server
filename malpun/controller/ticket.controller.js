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
                  <img src="cid:mxmlogo@maxima" alt="mxmLogo" width="226" height="62" style="width: 226px; height: 62px;" />
                </td>
              </tr>
              <tr>
                <td style="font-family: 'Nunito Sans', sans-serif; font-size: 15px; text-align: left; text-shadow: 0 2px 10px rgba(0.4, 0.4, 0.4, 0.4); margin-left: 1em; margin-right: 1em;">
                  <!-- Text Container -->
                  <p>
                    Hi, <b>${mahasiswa.name}</b>. Selamat datang di
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
                  <img src="${qrCodeImage}" alt="Your Image" width="200" height="200" style="width: 200px; height: 200px;" />
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
      to: mahasiswa.email,
      subject: "Ticket To Malam Puncak",
      attachDataUrls: true,
      html: emailHTML,
      attachments: [
        {
          filename: "MaximaLogo.webp",
          path: "./public/assets/MaximaLogo.webp",
          cid: "mxmlogo@maxima",
        },
      ],
    };
    const info = await transporter.sendMail(mailOptions);
    if (!info) {
      return res.status(404).send({
        code: 404,
        message: "gagal send email",
      });
    }
    
    await Mahasiswa.query()
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
