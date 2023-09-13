const env = require("dotenv").config({ path: "../../.env" });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomToken = require("random-token");
const { Model } = require("objection");
const Mahasiswa = require("../model/mahasiswa.model");
const MahasiswaForgotPasswordTokenStorage = require("../../mail/mahasiswa_forgot_password_token.model");
const stateRegDB = require("../../state/model/state_registration.model");
const postmarkClient = require("../../config/postmark");
const sendGridClient = require("../../config/sendgrid");

const {
  registerValidator,
  nimValidator,
} = require("../validation/mahasiswa.validation");
const { loginValidator } = require("../validation/auth.validation");
const mailConfig = require("../../config/mail");

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
      token: `MXM-${validateBody.data.nim}`,
      created_at: new Date(),
    });

    return res.status(201).send({
      code: 201,
      message: "Pendaftaran berhasil.",
    });
  } catch (err) {
    console.error(err);
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
      return res.status(404).json({
        code: 404,
        message: `Tidak dapat menemukan Mahasiswa dengan NIM ${req.body.nim}.`,
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
    console.log(err);
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

const getAllStudentWithState = async (req, res) => {
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

    const daftarState = await stateRegDB
      .query()
      .join(
        "state_activities",
        "state_activities.stateID",
        "=",
        "state_registration.stateID"
      )
      .orderBy("state_activities.day")
      .select(
        "state_registration.stateID",
        "state_activities.name as stateName",
        "state_registration.nim",
        "state_activities.day",
        "state_registration.attendanceTime",
        "state_registration.isFirstAttended",
        "state_registration.isLastAttended"
      );

    const data = daftarMahasiswa.map((mahasiswa) => {
      const state = daftarState.filter((state) => state.nim === mahasiswa.nim);
      return {
        ...mahasiswa,
        state,
      };
    });

    return res.status(200).send({
      code: 200,
      message: "Berhasil mengambil seluruh data mahasiswa.",
      data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

const getSpecificStudentWithStateByNim = async (req, res) => {
  const validateNim = await nimValidator.safeParseAsync(req.params.nim);

  if (!validateNim.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateNim.error,
    });
  }

  try {
    const dataMahasiswa = await Mahasiswa.query()
      .where({ nim: validateNim.data })
      .select(
        "nim",
        "name",
        "email",
        "whatsapp",
        "angkatan",
        "idLine",
        "prodi",
        "token"
      )
      .first();

    if (!dataMahasiswa) {
      return res.status(404).send({
        code: 404,
        message: `Mahasiswa dengan NIM : ${validateNim.data} tidak ditemukan.`,
      });
    }

    const state = await stateRegDB
      .query()
      .where({ nim: validateNim.data })
      .join(
        "state_activities",
        "state_activities.stateID",
        "=",
        "state_registration.stateID"
      )
      .orderBy("state_activities.day")
      .select(
        "state_registration.stateID",
        "state_activities.name as stateName",
        "state_registration.nim",
        "state_activities.day",
        "state_registration.attendanceTime",
        "state_registration.isFirstAttended",
        "state_registration.isLastAttended"
      );

    return res.status(200).send({
      code: 200,
      message: "Berhasil mengambil seluruh data mahasiswa.",
      data: {
        ...dataMahasiswa,
        state,
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
    console.error(err);
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
    console.error(err);
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
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

const getStatistic = async (req, res) => {
  const rundown = {
    maxTown: {
      start: process.env.MAX_TOWN_START,
      end: process.env.MAX_TOWN_END,
    },
    home: {
      start: process.env.HOME_START,
      end: process.env.HOME_END,
    },
  };

  try {
    let rawStatistic = await Mahasiswa.query()
      .select(
        Model.raw("DATE(mahasiswa.created_at) AS date"),
        Model.raw("COUNT(mahasiswa.created_at) AS registered")
      )
      .where(
        Model.raw("mahasiswa.created_at >= ?", rundown.maxTown.start),
        Model.raw("mahasiswa.created_at <= ?", rundown.maxTown.end)
      )
      .orWhere(
        Model.raw("mahasiswa.created_at >= ?", rundown.home.start),
        Model.raw("mahasiswa.created_at <= ?", rundown.home.end)
      )
      .groupByRaw("DATE(mahasiswa.created_at)")
      .orderByRaw("DATE(mahasiswa.created_at)");

    rawStatistic = rawStatistic.map((data) => ({
      ...data,
      date: new Date(data.date).toLocaleDateString(),
    }));

    let current = new Date(rundown.maxTown.start);
    const maxTownEnd = new Date(rundown.maxTown.end);
    const homeStart = new Date(rundown.home.start);
    const homeEnd = new Date(rundown.home.end);

    const homeStatistic = [];
    const maxTownStatistic = [];

    let rawStatisticCounter = 0;

    while (current <= maxTownEnd) {
      if (
        rawStatisticCounter >= rawStatistic.length ||
        current.toLocaleDateString() !== rawStatistic[rawStatisticCounter].date
      ) {
        maxTownStatistic.push({
          date: current.toISOString(),
          registered: 0,
        });
      } else {
        maxTownStatistic.push({
          date: current.toISOString(),
          registered: rawStatistic[rawStatisticCounter].registered,
        });
        rawStatisticCounter++;
      }
      current.setDate(current.getDate() + 1);
    }

    current = new Date(rundown.home.start);

    while (current <= homeEnd) {
      if (
        rawStatisticCounter >= rawStatistic.length ||
        current.toLocaleDateString() !== rawStatistic[rawStatisticCounter].date
      ) {
        homeStatistic.push({
          date: current.toISOString(),
          registered: 0,
        });
      } else {
        homeStatistic.push({
          date: current.toISOString(),
          registered: rawStatistic[rawStatisticCounter].registered,
        });
        rawStatisticCounter++;
      }
      current.setDate(current.getDate() + 1);
    }

    return res.status(200).send({
      code: 200,
      message: "Berhasil mendapatkan statistik registrasi mahasiswa.",
      data: {
        maxTown: maxTownStatistic,
        home: homeStatistic,
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

// API Client
const sendPasswordRecoveryLink = async (req, res) => {
  const { nim = "", email = "" } = req.body;
  // const nim = decoded_nim;

  const token = randomToken(48);
  try {
    const user = await Mahasiswa.query().where({ nim, email }).first();
    if (!user) {
      return res.status(404).send({
        code: 404,
        message: "Data yang kamu masukkan tidak terdaftar.",
      });
    }

    const currentDate = new Date();
    currentDate.setTime(
      currentDate.getTime() + process.env.EMAIL_TOKEN_EXPIRATION * 60 * 1000
    );
    const expires_at = currentDate;

    await MahasiswaForgotPasswordTokenStorage.query().where({ nim }).delete();

    const createToken =
      await MahasiswaForgotPasswordTokenStorage.query().insert({
        nim,
        token,
        expires_at,
      });

    const subject = "MAXIMA UMN - Password Recovery Link";
    const body = `
          <p>Halo, Maximers!</p>
          <p>Berikut adalah tautan untuk mengubah password akunmu.</p>
          <a target="_blank" href='${process.env.CLIENT_URL}/${process.env.EMAIL_CLIENT_REDIRECT_URL}?token=${token}'> Click here</a>
          `;
    const highTrafficBody = `
          <p>Halo, Maximers!</p>
          <p>(Traffic saat ini sedang tinggi, maaf kalau pengiriman emailnya lama ya...)</p>
          <p>Berikut adalah tautan untuk mengubah password akunmu.</p>
          <a target="_blank" href='${process.env.CLIENT_URL}/${process.env.EMAIL_CLIENT_REDIRECT_URL}?token=${token}'> Click here</a>
          `;

    // kasi message kalo off limit
    // mailConfig.sendMail({
    //   from : process.env.MAIL_ACCOUNT,
    //   to : user.email,
    //   subject,
    //   html : body
    // }, (err) => {
    //   if (err) throw new Error(err)
    //   return res.status(200).send({
    //     code : 200,
    //     message : "Berhasil mengirim tautan perubahan password melalui email."
    //   })
    // })

    // SENDGRID API

    const emailData = {
      from: "maxima.umn.website@gmail.com",
      to: user.email,
      subject,
      html: body,
    };

    console.log(emailData);

    sendGridClient
      .send(emailData)
      .then((response) => {
        return res.status(200).send({
          code: 200,
          message: "Berhasil mengirim tautan perubahan password melalui email.",
        });
      })
      .catch((err) => {
        mailConfig.sendMail(
          {
            from: process.env.MAIL_ACCOUNT,
            to: user.email,
            subject,
            html: highTrafficBody,
          },
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send({
                code: 500,
                message: err.message,
              });
            }
            return res.status(200).send({
              code: 200,
              message:
                "Berhasil mengirim tautan perubahan password melalui email.",
            });
          }
        );
      });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

const exchangePasswordRecoveryToken = async (req, res) => {
  const { token = "", password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({
        code: 400,
        message: "Kata sandi tidak boleh kosong.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        code: 400,
        message: "Kata sandi harus lebih panjang dari 8 karakter.",
      });
    }

    // const a = await MahasiswaForgotPasswordTokenStorage.query()
    //   .where({token}).first()

    // console.log(a.expires_at, new Date())
    // console.log(a.expires_at > new Date());


    const getToken = await MahasiswaForgotPasswordTokenStorage.query()
      .where({token})
      .first();    

    const nim = getToken?.nim || '';      

    const exchangeToken = await MahasiswaForgotPasswordTokenStorage.query()
      .where({ token })
      .delete();

    if (!exchangeToken) {
      return res.status(403).json({
        code: 403,
        message: "Token tidak valid.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Mahasiswa.query()  
      .where({nim})      
      .update({ password: hashedPassword })      

    return res.status(200).send({
      code: 200,
      message: "Berhasil mengubah kata sandi.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllStudent,
  getAllStudentWithState,
  getSpecificStudentWithStateByNim,
  getSpecificStudent,
  updateStudent,
  deleteStudent,
  getStatistic,
  sendPasswordRecoveryLink,
  exchangePasswordRecoveryToken,
};
