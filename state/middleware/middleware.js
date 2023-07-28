const PanitiaDB = require("../../user/model/panitia.model");
const OrgDB = require("../../user/model/organisator.model");

exports.isOrganisatorAndPanitia = async (req, res, next) => {
  try {
    const nim = req.decoded_nim;
    const organisator = await OrgDB.query().where({ nim });
    const panitia = await PanitiaDB.query().where({ nim });

    if (organisator.length === 0 && panitia.length === 0) {
      return res
        .status(403)
        .send({ message: "Anda tidak punya hak untuk akses ke halaman ini!" });
    }

    next();
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

exports.isOrganisatorAndPanitiaSpesifik = async (req, res, next) => {
  try {
    const { stateID } = req.params;
    const nim = req.decoded_nim;
    const organisator = await OrgDB.query().where({ nim });
    const panitia = await PanitiaDB.query().where({ nim });
    const authorizedDiv = ["D01", "D02", "D05"];

    if (organisator.length === 0 && panitia.length === 0) {
      return res
        .status(200)
        .send({ message: "Anda tidak punya hak untuk akses ke halaman ini!" });
    }

    if (panitia.length > 0 && !authorizedDiv.includes(panitia[0].divisiID)) {
      return res.status(403).send({
        message: "Divisi anda tidak punya otoritas yang cukup!",
      });
    }

    if (organisator.length > 0) {
      req.stateID = organisator[0].stateID;
    }

    if (organisator.length > 0 && stateID != organisator[0].stateID) {
      return res.status(403).send({
        message: "Tidak bisa menghapus STATE yang sedang anda gunakan!",
      });
    }

    req.divisiID = panitia.length > 0 ? panitia[0].divisiID : 0;
    next();
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
