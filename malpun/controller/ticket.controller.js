const nodemailer = require("nodemailer");
const Mahasiswa = require("../../user/model/mahasiswa.model");
const env = require("dotenv").config();
const QRCode = require("qrcode");
// const transporter = require("../../config/mail");
const mailConfig = require("../../config/mail");
const randomstring = require("randomstring");
const { empty } = require("uuidv4");

const sendEmail = async (req, res) => {
  try {
    const tokenMalpun = "MXM23-" + randomstring.generate(32);
    const nimMhs = req.decoded_nim;
    const mahasiswa = await Mahasiswa.query().where({ nim: nimMhs }).first();

    // return if ticket already claimed
    if (mahasiswa.ticketClaimed) {
      return res.status(404).send({
        code: 404,
        message: "kamu sudah meng-klaim tiket, silahkan cek email kamu",
      });
    }

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
                  <img src="https://storage.googleapis.com/mxm23-app-client/webps/webps/public/assets/MaximaLogoEmail.webp" alt="mxmLogo" width="226" height="62" style="width: 226px; height: 62px;" />
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
                  <a href="https://maxima.umn.ac.id/malpun/tiket/${tokenMalpun}" style="text-decoration: none; background-color: #F7B70C; color: #fff; padding: 10px 20px; border-radius: 64px; display: inline-block;">Claim Your Ticket</a>

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
      html: emailHTML,
    };

    await Mahasiswa.query()
      .where({ nim: nimMhs })
      .update({ ticketClaimed: 1, tokenMalpun })
      .first();

    mailConfig.sendMail(mailOptions).catch((err) => console.error(new Date(), err));

    return res.status(200).send({
      code: 200,
      data: tokenMalpun,
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

const mabamalpunlist = async (req, res) => {
  try {
    const mahasiswa = await Mahasiswa.query()
    .select("name", "nim", "ticketClaimed", "isAttendedMalpun", "tokenMalpun")
    .where({ ticketClaimed: 1 });

    if (!mahasiswa|| mahasiswa.length === 0) {
      return res.status(404).send({
        code: 404,
        message: "Gagal mendapatkan list",
      });
    }

    return res.status(200).send({
      code: 200,
      data: mahasiswa,
      message: "berhasil mendapatkan list",
    });
       

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
}

module.exports = {
  sendEmail,
  updateAlphagift,
  mabamalpunlist,
};
