const OrganisatorDB = require("../model/organisator.model");
const PanitDB = require("../model/panitia.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { loginValidator } = require("../validation/auth.validation");

exports.loginpanitorganisator = async (req, res) => {
  try {
    const validationResult = loginValidator.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).send({
        code: 400,
        message: "Validasi gagal.",
        error: validationResult.error,
      });
    }

    const cekOrg = await OrganisatorDB.query()
      .where({ nim: validationResult.data.nim })
      .first();
    const cekPanit = await PanitDB.query()
      .where({ nim: validationResult.data.nim })
      .first();

    if (!cekOrg && !cekPanit) {
      return res.status(400).send({
        code: 400,
        message: "Akun anda belum terdaftar",
      });
    }

    const passwordIsValid = await bcrypt.compare(
      validationResult.data.password,
      cekOrg ? cekOrg.password : cekPanit.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        code: 401,
        message: "Password salah!",
      });
    }

    if ((cekOrg && !cekOrg.isverified) || (cekPanit && !cekPanit.isverified)) {
      return res.status(401).send({
        code: 401,
        message: "Akun anda belum terverifikasi!",
      });
    }

    const JWTtoken = jwt.sign(
      {
        nim: cekOrg ? cekOrg.nim : cekPanit.nim,
        role: cekOrg ? "organisator" : "panit",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 86400, //equals to 24H
      }
    );

    return res.status(200).send({
      code: 200,
      message: "ok",
      data: {
        token: JWTtoken,
        expiresIn: 86400,
      },
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};
