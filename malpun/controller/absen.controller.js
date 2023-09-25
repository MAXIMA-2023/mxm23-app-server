const Mahasiswa = require("../../user/model/mahasiswa.model");
const External = require("../model/external.model");

exports.absenmalpun = async (req, res) => {
  const { token = "" } = req.body;

  try {
    const participantInternal = await Mahasiswa.query()
      .where({ tokenMalpun: token })
      .first();
    const participantExternal = await External.query().where({ token }).first();

    if (!participantInternal && !participantExternal) {
      return res.status(404).send({
        code: 404,
        message: `Tidak dapat menemukan peserta dengan token ${token}.`,
      });
    }

    const isAttendedMalpun = participantInternal
      ? participantInternal.isAttendedMalpun
      : participantExternal.isAttendedMalpun;

    if (isAttendedMalpun) {
      return res.status(409).send({
        code: 409,
        message: "Peserta sudah melalui proses absen sebelumnya.",
      });
    }

    if (participantInternal) {
      const nim = participantInternal.nim;
      await Mahasiswa.query().where({ nim }).update({ isAttendedMalpun: true });
    } else {
      const transactionID = participantExternal.transactionID;
      await External.query()
        .where({ transactionID })
        .update({ isAttendedMalpun: true });
    }

    return res.status(200).send({
      code: 200,
      message: "Berhasil melakukan absensi.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};
