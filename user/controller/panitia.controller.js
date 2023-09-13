const PanitDB = require("../model/panitia.model");
const DivisiDB = require("../model/divisi.model");
const MahasiswaDB = require("../model/mahasiswa.model");
const OrganisatorDB = require("../model/organisator.model");
const stateRegDB = require("../../state/model/state_registration.model");
const { validateEmptyEntries } = require("../../helpers/FormValidator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  registerValidator,
  nimValidator,
  verifyValidator,
} = require("../validation/panitia.validation");
const { loginValidator } = require("../validation/auth.validation");

exports.register = async (req, res) => {
  const validateBody = await registerValidator.safeParseAsync(req.body);
  if (!validateBody.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateBody.error,
    });
  }

  try {
    //cek nim
    const cekNIM = await PanitDB.query()
      .where({ nim: validateBody.data.nim })
      .first();
    if (cekNIM) {
      return res.status(400).send({
        code: 400,
        message: "NIM sudah terdaftar!",
      });
    }

    //cek divisi
    const cekDiv = await DivisiDB.query()
      .where({ divisiID: validateBody.data.divisiID })
      .first();
    if (!cekDiv) {
      return res.status(409).send({
        code: 409,
        message: "Divisi yang kamu input tidak terdaftar!",
      });
    }

    validateBody.data.password = await bcrypt.hash(
      validateBody.data.password,
      10
    );

    // if(validateBody.data.divisiID === 'D01'){
    //     return res.status(401).send({
    //         message: 'Anda tidak dapat mendaftar pada divisi tersebut'
    //     })
    // }

    await PanitDB.query().insert({
      ...validateBody.data,
      isverified: false,
    });

    return res.status(200).send({
      code: 200,
      message: "Berhasil melakukan registrasi",
    });
  } catch (err) {
    // logging.registerLog('Register/Panitia', nim, ip, err.message)
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  const validateBody = await loginValidator.safeParseAsync(req.body);

  if (!validateBody.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateBody.error,
    });
  }
  try {
    //cek nim terdaftar
    const panitia = await PanitDB.query()
      .where({ nim: validateBody.data.nim })
      .first();
    if (!panitia) {
      return res.status(404).send({
        code: 404,
        message: `NIM : ${validateBody.data.nim} tidak terdaftar! Harap melakukan register dahulu`,
      });
    }

    //compare password
    const isPassValid = bcrypt.compareSync(
      validateBody.data.password,
      panitia.password
    );
    if (!isPassValid) {
      return res.status(400).send({
        code: 400,
        message: "NIM atau password salah!",
      });
    }

    //is verivied
    if (!panitia.isverified) {
      return res.status(400).send({
        code: 400,
        message: "Akun anda belum terverifikasi!",
      });
    }

    const JWTtoken = jwt.sign(
      {
        nim: panitia.nim,
        role: "panit",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 86400, //equals to 24Hprocess.env.JWT_LIFETIME
      }
    );

    return res.status(200).send({
      code: 200,
      message: "Berhasil login",
      data: {
        token: JWTtoken,
        expiresIn: 86400,
      },
    });
  } catch (err) {
    // logging.loginLog('Login/Panitia', nim, ip, err.message)
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const panitia = await PanitDB.query()
      .where({ nim: req.decoded_nim })
      .first()
      .join("divisi", "panitia.divisiID", "=", "divisi.divisiID")
      .select(
        "panitia.nim",
        "panitia.name",
        "panitia.email",
        "panitia.isverified",
        "panitia.divisiID",
        "divisi.name as divisiName"
      );

    if (!panitia) {
      return res.status(404).send({
        code: 404,
        message: "Panitia tidak ditemukan",
      });
    }

    return res.status(200).send({
      code: 200,
      message: "Berhasil mengambil data profile panitia",
      data: panitia,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.readAllData = async (req, res) => {
  try {
    const result = await PanitDB.query()
      .join("divisi", "panitia.divisiID", "divisi.divisiID")
      .select(
        "panitia.nim",
        "panitia.name",
        "panitia.email",
        "panitia.isverified",
        "panitia.divisiID",
        "divisi.name as divisiName"
      );
    return res.status(200).send({
      code: 200,
      message: "Berhasil mengambil seluruh data panitia",
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

exports.readSpecificData = async (req, res) => {
  const validateNim = await nimValidator.safeParseAsync(req.params.nim);
  if (!validateNim.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateNim.error,
    });
  }
  try {
    //cek nim
    const panitia = await PanitDB.query()
      .where({ nim: validateNim.data })
      .first()
      .join("divisi", "panitia.divisiID", "=", "divisi.divisiID")
      .select(
        "panitia.nim",
        "panitia.name",
        "panitia.email",
        "panitia.isverified",
        "panitia.divisiID",
        "divisi.name as divisiName"
      );
    if (!panitia) {
      return res.status(400).send({
        code: 400,
        message: `NIM ${validateNim.data} tidak ditemukan`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: `Berhasil mendapatkan data panitia dengan NIM : ${validateNim.data}`,
      data: panitia,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

exports.updateData = async (req, res) => {
  const validateNim = await nimValidator.safeParseAsync(req.params.nim);
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
    //cek divisi terdaftar ato kaga
    if (validateBody.data.divisiID) {
      const cekDiv = await DivisiDB.query()
        .where({ divisiID: validateBody.data.divisiID })
        .first();
      if (!cekDiv) {
        return res.status(404).send({
          code: 404,
          message: "Divisi yang kamu input tidak terdaftar!",
        });
      }
    }

    if (validateBody.data.password) {
      validateBody.data.password = await bcrypt.hash(
        validateBody.data.password,
        10
      );
    }

    //update ke db
    const panitia = await PanitDB.query()
      .update(validateBody.data)
      .where({ nim: validateNim.data });
    if (!panitia) {
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
    return res.status(500).send({ code: 500, message: err.message });
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
    const authorizedDiv = ["D01", "D02"];
    const division = req.divisiID;
    if (!authorizedDiv.includes(division)) {
      return res.status(403).send({
        code: 403,
        message: "Kamu tidak memiliki akses untuk melakukan verifikasi akun",
      });
    }

    const panitia = await PanitDB.query()
      .where({ nim: validateNim.data })
      .update({ isverified: validateBody.data.isverified });
    if (!panitia) {
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
    return res.status(500).send({ code: 500, message: err.message });
  }
};

exports.deleteData = async (req, res) => {
  const validateNim = await nimValidator.safeParseAsync(req.params.nim);
  if (!validateNim.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateNim.error,
    });
  }

  try {
    //cek divisi dari D01/ D02 bukan
    const authorizedDiv = ["D01", "D02"];
    const division = req.divisiID;
    if (!authorizedDiv.includes(division)) {
      return res.status(403).send({
        code: 403,
        message: "Kamu tidak memiliki akses untuk menghapus akun",
      });
    }

    //delete panitia yang dipilih
    const panitia = await PanitDB.query()
      .where({ nim: validateNim.data })
      .delete();
    if (!panitia) {
      return res.status(404).send({
        code: 404,
        message: `Mahasiswa dengan NIM ${validateNim.data} tidak ditemukan.`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: `Berhasil menghapus data mahasiswa dengan NIM ${validateNim.data}.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      code: 500,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

exports.countAllData = async (req, res) => {
  try {
    //total panitia yang sudah daftar dan terverifikasi
    const panitCount = await PanitDB.query()
      .where("isverified", 1)
      .count("* as total")
      .first();

    //total panitia per divisi
    const userDivisiID = await PanitDB.query()
      .select("divisiID")
      .where({ nim: req.decoded_nim });
    const panitiaCountPerDivision = await PanitDB.query()
      .where({ divisiID: userDivisiID[0].divisiID })
      .count("* as total")
      .first();

    //total pic organisator yang daftar dan terverifikasi
    const orgCount = await OrganisatorDB.query()
      .where("isverified", 1)
      .count("* as total")
      .first();

    //total maba yang sdh buat akun
    const mhsCount = await MahasiswaDB.query().count("* as total").first();

    //total maba yang sudah ambil state
    const mhsStateCount = await stateRegDB
      .query()
      .countDistinct("nim as total")
      .first();

    return res.status(200).send({
      code: 200,
      message: "Berhasil mengambil seluruh data panitia",
      data: {
        totalPanit: panitCount.total,
        totalPanitPerDivisi: panitiaCountPerDivision.total,
        totalOrg: orgCount.total,
        totalMaba: mhsCount.total,
        totalMabaState: mhsStateCount.total,
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
