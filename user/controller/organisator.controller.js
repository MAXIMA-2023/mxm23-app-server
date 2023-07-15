const OrganisatorDB = require("../model/organisator.model");
const StateDB = require("../../state/model/state_activities.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateEmptyEntries } = require("../../helpers/FormValidator");
const {
  registerValidator,
  nimValidator,
  verifyValidator,
} = require("../validation/organisator.validation");
const { loginValidator } = require("../validation/auth.validation");

exports.registerOrganisator = async (req, res) => {
  const validateBody = await registerValidator.safeParseAsync(req.body);
  if (!validateBody.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateBody.error,
    });
  }
  try {
    const cekNIM = await OrganisatorDB.query()
      .where({ nim: validateBody.data.nim })
      .first();
    if (cekNIM) {
      return res.status(409).send({
        code: 409,
        message: "Akun anda sebelumnya telah terdaftar",
      });
    }

    const cekState = await StateDB.query()
      .where({ stateID: validateBody.data.stateID })
      .first();
    if (!cekState) {
      return res.status(409).send({
        code: 409,
        message: "STATE yang kamu input tidak terdaftar!",
      });
    }

    validateBody.data.password = await bcrypt.hash(
      validateBody.data.password,
      10
    );

    // Misal kalo cuman boleh 1 yang register per state
    // if(cekState.length !== 0){
    //     return res.status(400).send({
    //         message: 'Sudah ada yang register menggunakan STATE tersebut!'
    //     })
    // }

    await OrganisatorDB.query().insert({
      ...validateBody.data,
      isverified: 0,
    });
    return res.status(200).send({
      code: 200,
      massage: "Akun berhasil terdaftar!",
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.loginOrganisator = async (req, res) => {
  const validateBody = await loginValidator.safeParseAsync(req.body);
  if (!validateBody.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateBody.error,
    });
  }

  try {
    const account = await OrganisatorDB.query()
      .where({ nim: validateBody.data.nim })
      .first();

    //nim salah
    if (!account) {
      return res.status(404).send({
        code: 404,
        message: `NIM : ${validateBody.data.nim} tidak terdaftar! Harap melakukan register!`,
      });
    }

    //password salah
    const isPassValid = await bcrypt.compare(
      validateBody.data.password,
      account.password
    );
    if (!isPassValid) {
      return res.status(400).send({
        code: 400,
        message: "Password anda salah!",
      });
    }

    if (!account.isverified) {
      return res.status(400).send({
        code: 400,
        message: "Akun anda belum terverifikasi!",
      });
    }

    const JWTtoken = jwt.sign(
      {
        nim: account.nim,
        role: "organisator",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 86400, //equals to 24H
      }
    );

    return res.status(200).send({
      code: 200,
      message: "Berhasil login!",
      data: { token: JWTtoken, expiresIn: 86400 },
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const result = await OrganisatorDB.query()
      .where({ nim: req.decoded_nim })
      .first()
      .join(
        "state_activities",
        "organisator.stateID",
        "=",
        "state_activities.stateID"
      )
      .select(
        "organisator.nim",
        "organisator.name",
        "organisator.email",
        "organisator.stateID",
        "organisator.isverified",
        "state_activities.name as stateName"
      );

    return res.status(200).send({
      code: 200,
      message: "Berhasil mendapatkan data profile",
      data: result,
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.getOrganisator = async (req, res) => {
  try {
    const result = await OrganisatorDB.query()
      .join(
        "state_activities",
        "organisator.stateID",
        "=",
        "state_activities.stateID"
      )
      .select(
        "organisator.nim",
        "organisator.name",
        "organisator.email",
        "organisator.stateID",
        "organisator.isverified",
        "state_activities.name as stateName"
      );

    return res.status(200).send({
      code: 200,
      message: "Berhasil mendapatkan data organisator",
      data: result,
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.getOrganisatorspesifik = async (req, res) => {
  const validateNim = await nimValidator.safeParseAsync(req.params.nim);

  if (!validateNim.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateNim.error,
    });
  }

  try {
    const account = await OrganisatorDB.query()
      .where({ nim: validateNim.data })
      .first()
      .join(
        "state_activities",
        "organisator.stateID",
        "=",
        "state_activities.stateID"
      )
      .select(
        "organisator.nim",
        "organisator.name",
        "organisator.email",
        "organisator.stateID",
        "organisator.isverified",
        "state_activities.name as stateName"
      );

    if (!account) {
      return res.status(404).send({
        code: 404,
        message: `NIM : ${validateNim.data} tidak ditemukan`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: "Berhasil mendapatkan data organisator",
      data: account,
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.updateOrganisator = async (req, res) => {
  const validateNim = nimValidator.safeParse(req.params.nim);
  if (!validateNim.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateNim.error,
    });
  }

  const validateBody = await registerValidator
    .partial()
    .safeParseAsync(req.body);
  if (!validateBody.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateBody.error,
    });
  }

  try {
    const authorizedDiv = ["D01", "D02"];
    const division = req.divisiID;

    if (!authorizedDiv.includes(division)) {
      return res.status(403).send({
        code: 403,
        message: "Divisi anda tidak punya otoritas yang cukup!",
      });
    }

    const account = await OrganisatorDB.query()
      .where({ nim: validateNim.data })
      .first();
    if (!account) {
      return res.status(404).send({
        code: 404,
        message: `NIM : ${validateNim.data} tidak ditemukan!`,
      });
    }

    const liatState = await StateDB.query()
      .select("stateID")
      .where({ stateID: account.stateID })
      .first();
    if (!liatState) {
      return res.status(403).send({
        code: 403,
        message: "State anda tidak terdaftar!",
      });
    }

    if (validateBody.data.password) {
      validateBody.data.password = await bcrypt.hash(
        validateBody.data.password,
        10
      );
    }

    await OrganisatorDB.query()
      .where({ nim: validateNim.data })
      .update(validateBody.data);

    return res.status(200).send({
      code: 200,
      message: "Data berhasil diupdate",
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.verifyAcc = async (req, res) => {
  const validateNim = await nimValidator.safeParseAsync(req.params.nim);

  if (!validateNim.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateNim.error,
    });
  }

  const validateBody = await verifyValidator.safeParseAsync(req.body);
  if (!validateBody.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateBody.error,
    });
  }

  try {
    const authorizedDiv = ["D01", "D02", "D05"];
    const division = req.divisiID;

    if (!authorizedDiv.includes(division)) {
      return res.status(403).send({
        code: 403,
        message: "Divisi anda tidak punya otoritas yang cukup!",
      });
    }

    const cekNIM = await OrganisatorDB.query()
      .where({ nim: validateNim.data })
      .first();
    if (!cekNIM) {
      return res.status(404).send({
        code: 404,
        message: `NIM :${validateNim.data} tidak ditemukan!`,
      });
    }

    await OrganisatorDB.query()
      .update({
        isverified: validateBody.data.isverified,
      })
      .where({ nim: validateNim.data });
    return res.status(200).send({
      code: 200,
      message: "Data berhasil diupdate",
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.getDelete = async (req, res) => {
  const validateNim = await nimValidator.safeParseAsync(req.params.nim);

  if (!validateNim.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateNim.error,
    });
  }

  try {
    const authorizedDiv = ["D01", "D02"];
    const division = req.divisiID;

    if (!authorizedDiv.includes(division)) {
      return res.status(403).send({
        code: 403,
        message: "Divisi anda tidak punya otoritas yang cukup!",
      });
    }

    const cekNIM = await OrganisatorDB.query()
      .where({ nim: validateNim.data })
      .first();
    if (!cekNIM) {
      return res.status(404).send({
        code: 404,
        message: `NIM : ${validateNim.data} tidak ditemukan!`,
      });
    }

    await OrganisatorDB.query().delete().where({ nim: validateNim.data });
    return res.status(200).send({
      code: 200,
      message: "Data berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};
