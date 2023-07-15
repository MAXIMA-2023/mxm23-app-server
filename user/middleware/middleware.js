const jwt = require("jsonwebtoken");
const MahasiswaDB = require("../model/mahasiswa.model");
const PanitiaDB = require("../model/panitia.model");
const OrgDB = require("../model/organisator.model");

exports.verifyJWT = async (req, res, next) => {
  const token = req.headers.Authorization;
  if (!token) {
    return res.status(403).send({ message: "Harap login terlebih dahulu!" });
  }

  try {
    const decoded = jwt.verify(token.split[" "][1], process.env.JWT_SECRET);
    req.decoded_nim = decoded.nim;

    next();
  } catch (err) {
    return res
      .status(403)
      .send({ message: "Token anda tidak valid, harap login ulang!" });
  }
};

exports.isMahasiswa = async (req, res, next) => {
  try {
    const nim = req.decoded_nim;
    const data = await MahasiswaDB.query().where({ nim }).first();

    if (!data) {
      return res
        .status(403)
        .send({ message: "Anda tidak punya hak untuk akses ke halaman ini!" });
    }

    next();
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

exports.isPanitia = async (req, res, next) => {
  try {
    const nim = req.decoded_nim;
    const data = await PanitiaDB.query().where({ nim }).first();

    if (!data) {
      return res
        .status(403)
        .send({ message: "Anda tidak punya hak untuk akses ke halaman ini!" });
    }

    req.divisiID = data.divisiID;

    next();
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

exports.isOrganisator = async (req, res, next) => {
  try {
    const nim = req.decoded_nim;
    const data = await OrgDB.query().where({ nim }).first();

    if (!data) {
      return res
        .status(403)
        .send({ message: "Anda tidak punya hak untuk akses ke halaman ini!" });
    }

    next();
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
