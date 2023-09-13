const Mahasiswa = require("../../user/model/mahasiswa.model");
const External = require("../model/external.model");

exports.absenmalpuninternal = async (req, res) => {

  const { token = "" } = req.body;

  try {
    const participant = await Mahasiswa.query().where({ token }).first();

    if (!participant) {
      return res.status(404).send({
        code: 404,
        message: "Token tidak valid.",
      });
    }

    const nim = participant.nim;

    const registration = await Mahasiswa
      .query()
      .where({ nim })
      .first();

    if (!registration) {
      return res.status(404).send({
        code: 404,
        message: "Tidak terdaftar pada state ini.",
      });
    }

    if (registration.isAttendedMalpun) {
      return res.status(409).send({
        code: 409,
        message: "Peserta sudah melalui proses absen sebelumnya.",
      });
    }

    await Mahasiswa
      .query()
      .where({ nim })
      .update({ isAttendedMalpun: true});


    return res.status(200).send({
      code: 200,
      message: "Berhasil melakukan absensi.",
    });
  } catch (err) {
    console.error(err)
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
}

// absenmalpunexternal = async (req, res) => {

//   const { token = "" } = req.body;

//   try {
//     const participant = await Mahasiswa.query().where({ token }).first();

//     if (!participant) {
//       return res.status(404).send({
//         code: 404,
//         message: "Token tidak valid.",
//       });
//     }

//     const nim = participant.nim;

//     const registration = await Mahasiswa
//       .query()
//       .where({ nim })
//       .first();

//     if (!registration) {
//       return res.status(404).send({
//         code: 404,
//         message: "Tidak terdaftar pada state ini.",
//       });
//     }

//     if (registration.ticketClaimed) {
//       return res.status(409).send({
//         code: 409,
//         message: "Peserta sudah melalui proses absen sebelumnya.",
//       });
//     }

//     await Mahasiswa
//       .query()
//       .where({ nim })
//       .update({ ticketClaimed: true});
//   } catch (err) {
//         console.error(err)
// return res.status(500).send({
//       code: 500,
//       message: err.message,
//     });
//   }
// }