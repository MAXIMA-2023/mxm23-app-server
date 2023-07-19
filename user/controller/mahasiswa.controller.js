const env = require('dotenv').config({path : '../../.env'});
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomToken = require('random-token');
const { Model } = require('objection');
const Mahasiswa = require("../model/mahasiswa.model");
const {
  registerValidator,
  nimValidator,
} = require("../validation/mahasiswa.validation");
const { loginValidator } = require("../validation/auth.validation");
const mail = require('../../config/mail');


// API Client
const register = async (req, res) => {
  const validateBody = await registerValidator.safeParseAsync(req.body);

  if (!validateBody.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateBody.error,
    });
  }
  try {
    const mahasiswa = await Mahasiswa.query()
      .where({ nim: validateBody.data.nim })
      .first();
    if (mahasiswa) {
      return res.status(400).send({
        code: 400,
        message: "NIM kamu telah terdaftar sebelumnya.",
      });
    }

    validateBody.data.password = await bcrypt.hash(
      validateBody.data.password,
      10
    );

    // Sukses
    await Mahasiswa.query().insert({
      ...validateBody.data,
      token: `MXM23-${validateBody.data.nim}`,
      created_at : new Date()
    });

    return res.status(201).send({
      code: 201,
      message: "Pendaftaran berhasil.",
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

// API Client
const login = async (req, res) => {
  // NOTE : login pake nim aja ato (nim or email) ato gmn??
  const validateBody = await loginValidator.safeParseAsync(req.body);

  if (!validateBody.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateBody.error,
    });
  }

  try {
    // Cek NIM & Password
    const mahasiswa = await Mahasiswa.query()
      .where({ nim: validateBody.data.nim })
      .first();
    if (!mahasiswa) {
      return res.status(401).json({
        code: 404,
        message: `Tidak dapat menemukan Mahasiswa dengan NIM ${nim}.`,
      });
    }

    if (
      !(await bcrypt.compare(validateBody.data.password, mahasiswa.password))
    ) {
      return res.status(401).json({
        code: 401,
        message: "NIM dan/atau kata sandi salah.",
      });
    }

    // Assign JWT
    const token = jwt.sign({ nim: mahasiswa.nim }, process.env.JWT_SECRET, {
      expiresIn: 86400,
    }); // NOTE : lifetime berapa lama?

    // res.cookie("__SESS_TOKEN", token, {
    //   httpOnly: true,
    //   sameSite: "None",
    //   secure: true,
    // });

    return res.status(200).send({
      code: 200,
      message: "Login berhasil.",
      data: {
        token,
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

const getProfile = async (req, res) => {
  try {
    const mahasiswa = await Mahasiswa.query()
      .where({ nim: req.decoded_nim })
      .first()
      .select(
        "nim",
        "name",
        "email",
        "whatsapp",
        "angkatan",
        "idLine",
        "prodi",
        "token"
      );
    if (!mahasiswa) {
      return res.status(404).send({
        code: 404,
        message: `Mahasiswa dengan NIM : ${req.decoded_nim} tidak ditemukan.`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: `Berhasil mengambil data mahasiswa dengan NIM : ${req.decoded_nim}`,
      data: mahasiswa,
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

// API Internal
const getAllStudent = async (req, res) => {
  try {
    const daftarMahasiswa = await Mahasiswa.query().select(
      "nim",
      "name",
      "email",
      "whatsapp",
      "angkatan",
      "idLine",
      "prodi",
      "token"
    );

    return res.status(200).send({
      code: 200,
      message: "Berhasil mengambil seluruh data mahasiswa.",
      data: daftarMahasiswa,
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

// API Internal
const getSpecificStudent = async (req, res) => {
  try {
    const validateNim = await nimValidator.safeParseAsync(req.params.nim);

    if (!validateNim.success) {
      return res.status(400).send({
        code: 400,
        message: "Validasi gagal.",
        error: validateNim.error,
      });
    }

    const mahasiswa = await Mahasiswa.query()
      .where({ nim: validateNim.data })
      .first()
      .select(
        "nim",
        "name",
        "email",
        "whatsapp",
        "angkatan",
        "idLine",
        "prodi",
        "token"
      );
    if (!mahasiswa) {
      return res.status(404).send({
        code: 404,
        message: `Mahasiswa dengan NIM : ${validateNim.data} tidak ditemukan.`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: `Berhasil mengambil data mahasiswa dengan NIM : ${validateNim.data}`,
      data: mahasiswa,
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

// API Internal
const updateStudent = async (req, res) => {
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

  if (validateBody.data.password) {
    validateBody.data.password = await bcrypt.hash(
      validateBody.data.password,
      10
    );
  }

  try {
    const mahasiswa = await Mahasiswa.query()
      .where({ nim: validateNim.data })
      .update({
        ...validateBody.data,
        token: validateBody.data.nim
          ? `MXM-${validateBody.data.nim}`
          : undefined,
      })
      .first();

    if (!mahasiswa) {
      return res.status(404).send({
        code: 404,
        message: `Mahasiswa dengan NIM : ${validateNim.data} tidak ditemukan.`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: `Berhasil mengubah data mahasiswa dengan NIM : ${validateNim.data}`,
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

// API Internal
const deleteStudent = async (req, res) => {
  const validateNim = await nimValidator.safeParseAsync(req.params.nim);

  if (!validateNim.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateNim.error,
    });
  }

  try {
    const mahasiswa = await Mahasiswa.query()
      .where({ nim: validateNim.data })
      .delete();
    if (!mahasiswa) {
      return res.status(404).send({
        code: 404,
        message: `Mahasiswa dengan NIM : ${validateNim.data} tidak ditemukan.`,
      });
    }

    return res.status(200).send({
      code: 200,
      message: `Berhasil menghapus data mahasiswa dengan NIM : ${validateNim.data}`,
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};


const getStatistic = async (req, res) => {

  const rundown = {
    maxTown : {
      start : process.env.MAX_TOWN_START, 
      end : process.env.MAX_TOWN_END, 
    }, 
    home : {
      start : process.env.HOME_START, 
      end : process.env.HOME_END
    }
  }

  try {
    let rawStatistic = await Mahasiswa.query()
        .select(
          Model.raw('DATE(mahasiswa.created_at) AS date'),
          Model.raw('COUNT(mahasiswa.created_at) AS registered')
        )
        .where(
          Model.raw('mahasiswa.created_at >= ?', rundown.maxTown.start),
          Model.raw('mahasiswa.created_at <= ?', rundown.maxTown.end)
        )
        .orWhere(
          Model.raw('mahasiswa.created_at >= ?', rundown.home.start),
          Model.raw('mahasiswa.created_at <= ?', rundown.home.end)
        )
        .groupByRaw('DATE(mahasiswa.created_at)')
        .orderByRaw('DATE(mahasiswa.created_at)'); 

    rawStatistic = rawStatistic.map(data => ({
        ...data,
        date : new Date(data.date).toLocaleDateString()
    }));

    // current as starting point
    let current = new Date(rundown.maxTown.start);

    const maxTownEnd = new Date(rundown.maxTown.end);
    const homeStart = new Date(rundown.home.start);
    const homeEnd = new Date(rundown.home.end);

    const homeStatistic = [];
    const maxTownStatistic = [];

    let rawStatisticCounter = 0;
 
    while(current <= maxTownEnd){
        if (current.toLocaleDateString() != rawStatistic[rawStatisticCounter].date){
          maxTownStatistic.push({
            date : current.toISOString(), 
            registered : 0
          });
        } else {
          maxTownStatistic.push({
            date : current.toISOString(), 
            registered : rawStatistic[rawStatisticCounter++].registered
          });        
        }
        current.setDate(current.getDate() + 1);
    }

    current = homeStart;


    while (current <= homeEnd){
      if (current.toLocaleDateString() != rawStatistic[rawStatisticCounter]){
        homeStatistic.push({
          date : current.toISOString(), 
          registered : 0
        });
      } else {
        homeStatistic.push({
          date : current.toISOString(), 
          registered : rawStatistic[rawStatisticCounter++].registered
        });
      }     
      current.setDate(current.getDate() + 1);
    }


    return res.status(200).send({
      code : 200, 
      message : "Berhasil mendapatkan statistik registrasi mahasiswa.", 
      data : {
          maxTown : maxTownStatistic,
          home : homeStatistic
      }
    });

  } catch(err){
    return res.status(500).send({
      code: 500,
      message: err.message,
    });    
  }

 
}

// API Client 
const sendPasswordRecoveryLink = async (req, res) => {
  const { decoded_nim = "" } = req;

  const token = randomToken(48);
}

module.exports = {
  register,
  login,
  getProfile,
  getAllStudent,
  getSpecificStudent,
  updateStudent,
  deleteStudent,
  getStatistic
};
