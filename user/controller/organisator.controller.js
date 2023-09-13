const OrganisatorDB = require("../model/organisator.model");
const StateDB = require("../../state/model/state_activities.model");
const stateRegDB = require("../../state/model/state_registration.model");
const DayManagementDB = require("../../state/model/day_management.model");
const { Model } = require("objection");
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
    console.error(err);
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
    const organisator = await OrganisatorDB.query()
      .where({ nim: validateBody.data.nim })
      .first();

    //nim salah
    if (!organisator) {
      return res.status(404).send({
        code: 404,
        message: `NIM : ${validateBody.data.nim} tidak terdaftar! Harap melakukan register!`,
      });
    }

    //password salah
    const isPassValid = await bcrypt.compare(
      validateBody.data.password,
      organisator.password
    );
    if (!isPassValid) {
      return res.status(400).send({
        code: 400,
        message: "Password anda salah!",
      });
    }

    if (!organisator.isverified) {
      return res.status(400).send({
        code: 400,
        message: "Akun anda belum terverifikasi!",
      });
    }

    const JWTtoken = jwt.sign(
      {
        nim: organisator.nim,
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
    console.error(err);
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
    console.error(err);
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
    console.error(err);
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
    const organisator = await OrganisatorDB.query()
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

    if (!organisator) {
      return res.status(404).send({
        code: 404,
        message: `NIM : ${validateNim.data} tidak ditemukan`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: "Berhasil mendapatkan data organisator",
      data: organisator,
    });
  } catch (err) {
    console.error(err);
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

    if (validateBody.data.stateID) {
      const liatState = await StateDB.query()
        .select("stateID")
        .where({ stateID: validateBody.data.stateID })
        .first();
      if (!liatState) {
        return res.status(403).send({
          code: 403,
          message: "State yang anda pilih tidak terdaftar!",
        });
      }
    }

    if (validateBody.data.password) {
      validateBody.data.password = await bcrypt.hash(
        validateBody.data.password,
        10
      );
    }

    const organisator = await OrganisatorDB.query()
      .where({ nim: validateNim.data })
      .update(validateBody.data);

    if (!organisator) {
      return res.status(404).send({
        code: 404,
        message: `NIM : ${validateNim.data} tidak ditemukan!`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: "Data berhasil diupdate",
    });
  } catch (err) {
    console.error(err);
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

    const organisator = await OrganisatorDB.query()
      .update({
        isverified: validateBody.data.isverified,
      })
      .where({ nim: validateNim.data });

    if (!organisator) {
      return res.status(404).send({
        code: 404,
        message: `NIM :${validateNim.data} tidak ditemukan!`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: "Data berhasil diupdate",
    });
  } catch (err) {
    console.error(err);
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

    const organisator = await OrganisatorDB.query()
      .where({ nim: validateNim.data })
      .delete();
    if (!organisator) {
      return res.status(404).send({
        code: 404,
        message: `NIM : ${validateNim.data} tidak ditemukan!`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: "Data berhasil dihapus",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.getStatistic = async (req, res) => {
  const { decoded_nim } = req;
  const { stateID = "" } = req.params;

  try {
    const state = await StateDB.query()
      .where({ "state_activities.stateID": stateID })
      .where({ "organisator.nim": decoded_nim })
      .join("organisator", function () {
        this.on(
          Model.raw("organisator.stateID"),
          "=",
          Model.raw("state_activities.stateID")
        );
      })
      .first();

    if (!state) {
      return res.status(404).send({
        code: 404,
        message: "State tidak ditemukan.",
      });
    }

    // const result = await DayManagementDB.query()
    //       .select(Model.raw('day_management.date as day'))
    //       .count('state_registration.stateID as total')
    //       .leftJoin('state_registration', function(){
    //         this.on(Model.raw('DAY(day_management.date)'), '=', Model.raw('DAY(state_registration.created_at)'));
    //       })
    //       .where({'state_registration.stateID' : stateID})
    //       .groupBy(Model.raw('DAY(day_management.date), day_management.date'));

    const result = await stateRegDB
      .query()
      .select("state_registration.created_at as day")
      .count("* as total")
      .where({ "state_registration.stateID": stateID })
      .groupBy(Model.raw("date(state_registration.created_at )"));

    return res.status(200).send({
      code: 200,
      message: "Berhasil mendapatkan statistik state.",
      data: {
        state: state.name,
        statistic: result,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.getCountData = async (req, res) => {
  try {
    const orgStateID = await OrganisatorDB.query()
      .select("stateID")
      .where({ nim: req.decoded_nim })
      .first();

    const totalMaba = await stateRegDB
      .query()
      .where({ stateID: orgStateID.stateID })
      .count(" * as total")
      .first();
    return res.status(200).send({
      code: 200,
      message: "Berhasil mendapatkan data organisator",
      data: totalMaba.total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};
