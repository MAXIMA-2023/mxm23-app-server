const stateRegDB = require("../model/state_registration.model");
const stateDB = require("../model/state_activities.model");
const MhsDB = require("../../user/model/mahasiswa.model");
const { validateEmptyEntries } = require("../../helpers/FormValidator");
const { Model, ForeignKeyViolationError } = require("objection");
const Mahasiswa = require("../../user/model/mahasiswa.model");
const {
  nimValidator,
  stateIDValidator,
  dayValidator,
} = require("../validation/state_registration.validation");

/*
NOTE untuk INTERNAL STATE: pendaftaran maba ke state (christo):
-   Fitur untuk organisator dan panit:
    - READ data yang daftar (all, specific(by nim dan token), by day, by stateID,)
    - UPDATE data yang daftar (cmn bisa facio dan bph doang) 
    - DELETE data yang daftar (cmn bisa facio dan bph doang)

- Data yng ada di db state_registration:
    - [stateID] id state yang didaftar maba
    - [nim] nim maba yang daftar
    - [attendanceTIme] current time stamp saat maba absen
    - [isFirstAttended] 0/1, 0 jika belum absen, 1 jika sudah absen pertama
    - [isLastAttended] 0/1, 0 jika belum absen, 1 jika sudah absen kedua

-   Gw udah nyiapin data dummy di database state_registration, state_activities, dan mahasiswa
    jadi tinggal di update db lu, dan tinggal pake buat testing.

-   terdapat toggle untuk mengatur setiap batas waktu dari UPDATE dan DELETE.
    untuk pengecekan udah ada di middleware toggle di toggle\middleware\toggle.middleware.js
    langsung pake di route aja.

-   UNTUK panit D01,D02,D05(Eventus) bisa melihat semua list maba yang regis state
-   UNTUK organisator, hanya dapat melihat list maba yg daftar di state mereka sendiri

-   pastikan data yang ditampilkan adalah nim dan nama mhs, serta nama state yang didaftar, waktu absen,
    dan status absen (absen pertama, absen kedua). Yang berarti perlu join table state_activities, dan mahasiswa ke state_registration.

*/
const readAllReg = async (req, res) => {
  try {
    let result = await stateRegDB
      .query()
      .join("mahasiswa", "state_registration.nim", "=", "mahasiswa.nim")
      .join(
        "state_activities",
        "state_registration.stateID",
        "=",
        "state_activities.stateID"
      )
      .select(
        "state_registration.stateID",
        "mahasiswa.nim",
        "mahasiswa.token",
        "mahasiswa.name",
        "state_registration.created_at",
        "state_registration.attendanceTime",
        "state_registration.isFirstAttended",
        "state_registration.isLastAttended",
        "state_activities.name as stateName",
        "state_activities.day"
      );

    return res.status(200).send({
      code: 200,
      message: "Berhasil mendapatkan data pendaftaran STATE.",
      data: result,
    });
  } catch (err) {
    return res.status(500).send({ code: 500, message: err.message });
  }
};
const readSpecificReg = async (req, res) => {
  const validateNim = await nimValidator.safeParseAsync(req.params.nim);
  if (!validateNim.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateNim.error,
    });
  }

  try {
    let result = await stateRegDB
      .query()
      .where({ "state_registration.nim": validateNim.data })
      .join("mahasiswa", "state_registration.nim", "=", "mahasiswa.nim")
      .join(
        "state_activities",
        "state_registration.stateID",
        "=",
        "state_activities.stateID"
      )
      .select(
        "state_registration.stateID",
        "mahasiswa.nim",
        "mahasiswa.token",
        "mahasiswa.name",
        "state_registration.created_at",
        "state_registration.attendanceTime",
        "state_registration.isFirstAttended",
        "state_registration.isLastAttended",
        "state_activities.name as stateName",
        "state_activities.day"
      );

    return res.status(200).send({
      code: 200,
      message: `Berhasil mendapatkan data pendaftaran STATE untuk nim : ${validateNim.data}`,
      data: result,
    });
  } catch (err) {
    return res.status(500).send({ code: 500, message: err.message });
  }
};

const readStateRegByStateID = async (req, res) => {
  try {
    const stateID = await stateIDValidator.safeParseAsync(req.params.stateID);
    if (!stateID.success) {
      return res.status(400).send({
        code: 400,
        message: "Validasi gagal.",
        error: stateID.error,
      });
    }

    cekSID = await stateDB.query().where({ stateID: stateID.data }).first();
    if (!cekSID) {
      return res.status(404).send({
        message: `STATE ID : ${stateID.data} tidak ditemukan!`,
      });
    }

    result = await stateRegDB
      .query()
      .where({ "state_registration.stateID": stateID.data })
      .join("mahasiswa", "state_registration.nim", "=", "mahasiswa.nim")
      .join(
        "state_activities",
        "state_registration.stateID",
        "=",
        "state_activities.stateID"
      )
      .select(
        "state_registration.stateID",
        "mahasiswa.nim",
        "mahasiswa.token",
        "mahasiswa.name",
        "state_registration.created_at",
        "state_registration.attendanceTime",
        "state_registration.isFirstAttended",
        "state_registration.isLastAttended",
        "state_activities.name as stateName",
        "state_activities.stateLogo",
        "state_activities.day"
      );

    return res.status(200).send({
      code: 200,
      message: `Berhasil mendapatkan data pendaftaran STATE untuk stateID : ${stateID.data}`,
      data: result,
    });
  } catch (err) {
    return res.status(500).send({ code: 500, message: err.message });
  }
};

const readStateRegByDay = async (req, res) => {
  const day = await dayValidator.safeParseAsync(req.params.day);
  if (!day.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: day.error,
    });
  }

  try {
    const result = await stateDB
      .query()
      .where({ "state_activities.day": day.data })
      .join(
        "state_registration",
        "state_activities.stateID",
        "=",
        "state_registration.stateID"
      )
      .join("mahasiswa", "state_registration.nim", "=", "mahasiswa.nim")
      .select(
        "state_registration.stateID",
        "mahasiswa.nim",
        "mahasiswa.token",
        "mahasiswa.name",
        "state_registration.created_at",
        "state_registration.attendanceTime",
        "state_registration.isFirstAttended",
        "state_registration.isLastAttended",
        "state_activities.name as stateName",
        "state_activities.stateLogo",
        "state_activities.day"
      );

    return res.status(200).send({
      code: 200,
      message: `Berhasil mendapatkan data pendaftaran STATE untuk DAY : ${day.data}`,
      data: result,
    });
  } catch (err) {
    return res.status(500).send({ code: 500, message: err.message });
  }
};

// gak kepake keknya
const updateRegData = async (req, res) => {
  const { stateIDNew } = req.body;
  const { stateID, nim } = req.params;

  try {
    const divisiID = req.divisiID;
    if (divisiID === "D05") {
      return res.status(200).send({
        message: "Divisi anda tidak punya otoritas yang cukup!",
      });
    }
    //nim kosong?
    if (nim === null || nim === ":nim") {
      return res.status(200).send({
        message: "NIM anda kosong! Harap diisi terlebih dahulu",
      });
    }

    const emptyEntriesValidation = validateEmptyEntries(req.body);
    if (emptyEntriesValidation.length > 0) {
      return res.status(400).send({
        message: "Kolom input kosong.",
        error: emptyEntriesValidation,
      });
    }

    const cekSTATE = await stateDB.query().where({ stateID: stateIDNew });
    if (cekSTATE.length === 0 || cekSTATE === []) {
      return res.status(404).send({
        message: "STATE yang kamu input tidak terdaftar, dicek lagi ya!",
      });
    }

    const cekRegister = await stateRegDB.query().where({ nim, stateID });
    if (cekRegister.length === 0 || cekRegister === []) {
      return res.status(403).send({
        message: "Kamu tidak mendaftar pada STATE ini!",
      });
    }

    const cekReg = await stateRegDB
      .query()
      .select("stateID")
      .where({ nim, stateID: stateIDNew });
    if (cekReg.length != 0 && cekReg != []) {
      return res.status(403).send({
        message: "Kamu sudah mendaftar pada STATE ini!",
      });
    }

    await stateRegDB.query().where({ stateID }).update({
      stateID: stateIDNew,
    });

    // const cekDivisi = req.stateID
    return res.status(200).send({ message: "Data berhasil diupdate" });
  } catch (err) {
    return res.status(500).send({
      message: "Halo Maximers, maaf ada kesalahan dari internal " + err,
    });
  }
};

const deleteRegData = async (req, res) => {
  const { nim } = req.params;
  const nim2 = req.decoded_nim;
  // const ip = address.ip()

  try {
    const divisiID = req.divisiID;
    if (divisiID === "D05") {
      return res.status(200).send({
        message: "Divisi anda tidak punya otoritas yang cukup!",
      });
    }

    const { stateID } = req.params;
    if (nim === null || nim === ":nim") {
      return res.status(404).send({
        message: "NIM anda kosong! Harap diisi terlebih dahulu",
      });
    }

    if (stateID === null || stateID === ":stateID") {
      return res.status(404).send({
        message: "STATE ID kosong! Harap diisi terlebih dahulu",
      });
    }

    if (nim2 != nim) {
      return res.status(403).send({
        message: "Kamu tidak dapat menghapus Registered STATE milik akun lain!",
      });
    }

    const cekSTATE = await stateDB.query().where({ stateID });
    if (cekSTATE.length === 0 || cekSTATE === []) {
      return res.status(404).send({
        message: "STATE yang kamu input tidak terdaftar, dicek lagi ya!",
      });
    }

    const cekRegister = await stateRegDB.query().where({ nim, stateID });
    if (cekRegister.length === 0 || cekRegister === []) {
      return res.status(403).send({
        message: "Kamu belum mendaftar pada STATE ini!",
      });
    }

    await stateRegDB.query().delete().where({ nim, stateID });
    const dbActivities = await stateDB.query().where({ stateID });

    await stateDB
      .query()
      .where("stateID", stateID)
      .patch({
        registered: dbActivities[0].registered - 1,
      });

    return res
      .status(200)
      .send({ message: "Registrasi STATE berhasil dihapus" });
  } catch (err) {
    // logging.cancelStateLog('CancelState', nim, ip, err.message)
    return res.status(500).send({
      message: "Halo Maximers, maaf ada kesalahan dari internal " + err,
    });
  }
};

const handleRegistration = async (req, res) => {
  const { stateID } = req.body;
  const { decoded_nim : nim } = req;
  const body = { nim, stateID };

  // Cek input kosong
  const emptyEntriesValidation = validateEmptyEntries(body);
  if (emptyEntriesValidation.length > 0) {
    return res.status(400).send({
      code: 400,
      message: "Kolom input kosong.",
      error: emptyEntriesValidation,
    });
  }

  const transaction = await Model.startTransaction();

  try {
    // Cek total pendaftaran
    const registeredState = await stateRegDB
      .query()
      .where({ nim })
      .withGraphFetched("state_activities");
    if (registeredState.length >= 3) {
      return res.status(403).send({
        code: 403,
        error: "REGISTRATION_LIMIT_EXCEEDED",
        message: "Anda tidak diperbolehkan mendaftar pada lebih dari 3 state.",
      });
    }

    // Cek keberadaan stateID
    const state = await stateDB.query().where({ stateID }).first();
    if (!state) {
      return res.status(404).send({
        code: 404,
        message: "State tidak terdaftar.",
      });
    }

    // Cek apakah sudah pernah mendaftar di state yang sama
    const duplicateRegistration = registeredState.filter(
      (data) => data.stateID == stateID
    ).length;
    if (duplicateRegistration) {
      return res.status(403).send({
        code: 403,
        error: "DUPLICATE_REGISTRATION",
        message: "Anda telah terdaftar.",
      });
    }

    // Cek apakah peserta mendaftar lebih dari 1 state pada 1 hari yang sama
    const checkSameDayRegistration = [];

    for (let data of registeredState) {
      checkSameDayRegistration.push(data.state_activities.day);
      if (checkSameDayRegistration.includes(state.day)) {
        return res.status(403).send({
          code: 403,
          error: "SAME_DAY_REGISTRATION",
          message:
            "Anda tidak diperbolehkan mendaftar lebih dari 1 state pada 1 hari yang sama.",
        });
      }
    }

    // Cek apakah kuota state penuh
    if (state.registered >= state.quota) {
      return res.status(403).send({
        code: 403,
        error: "INSUFFICIENT_QUOTA",
        message: "Kuota untuk state ini sudah penuh.",
      });
    }

    // Masukkin record ke database
    const insert = await stateRegDB.query().insert({
      stateID,
      nim,
      attendanceTime: null,
      isFirstAttended: false,
      isLastAttended: false,
      created_at: new Date(),
    });
    if (!insert) throw new Error();

    // Update registered quota
    const updateQuota = await stateDB
      .query()
      .where({ stateID })
      .update({
        registered: state.registered + 1,
      });
    if (!updateQuota) throw new Error();

    await transaction.commit();

    return res.status(201).send({
      code: 201,
      message: "Pendaftaran STATE berhasil.",
    });
  } catch (err) {
    await transaction.rollback();

    if (err instanceof ForeignKeyViolationError) {
      return res.status(400).send({
        code: 400,
        error: "INVALID_PARTICIPANT_ID",
        message: "Mahasiswa tidak terdaftar.",
      });
    }

    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

const cancelRegistration = async (req, res) => {
  const { stateID = "" } = req.params;
  const nim = req.decoded_nim || "";

  const transaction = await Model.startTransaction();

  try {
    const deleteRegistrationData = await stateRegDB
      .query()
      .where({
        nim,
        stateID,
      })
      .delete();

    if (!deleteRegistrationData) {
      return res.status(404).send({
        code: 404,
        message: "Data pendaftaran tidak ditemukan.",
      });
    }

    const decrementRegisteredQuota = await stateDB 
      .query()
      .where({stateID})
      .decrement('registered', 1);
      
    await transaction.commit();

    return res.status(200).send({
      code: 200,
      message: "Berhasil menghapus data pendaftaran STATE.",
    });
  } catch (err) {
    await transaction.rollback();
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

const handleFirstAttendance = async (req, res) => {
  const { token = "", stateID = "" } = req.body;

  try {
    const participant = await Mahasiswa.query().where({ token }).first();

    if (!participant) {
      return res.status(404).send({
        code: 404,
        message: "Token tidak valid.",
      });
    }

    const nim = participant.nim;

    const registration = await stateRegDB
      .query()
      .where({ stateID, nim })
      .first();

    if (!registration) {
      return res.status(404).send({
        code: 404,
        message: "Tidak terdaftar pada state ini.",
      });
    }

    if (registration.isFirstAttended) {
      return res.status(409).send({
        code: 409,
        message: "Peserta sudah melalui proses absen sebelumnya.",
      });
    }

    const markAttendance = await stateRegDB
      .query()
      .where({ stateID, nim })
      .update({ attendanceTime: new Date(), isFirstAttended: true });

    if (!markAttendance) {
      return res.status(404).send({
        code: 404,
        message: "Tidak terdaftar pada state ini.",
      });
    }

    return res.status(200).send({
      code: 200,
      message: "Berhasil melakukan absensi.",
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

const handleLastAttendance = async (req, res) => {
  const { token = "", stateID = "" } = req.body;
  // const nim = req.decoded_nim;

  try {
    const participant = await Mahasiswa.query().where({ token }).first();

    if (!participant) {
      return res.status(404).send({
        code: 404,
        message: "Token tidak valid.",
      });
    }

    const nim = participant.nim;

    const registration = await stateRegDB
      .query()
      .where({ stateID, nim })
      .first();

    if (!registration) {
      return res.status(404).send({
        code: 404,
        message: "Tidak terdaftar pada state ini.",
      });
    }

    if (!registration.isFirstAttended) {
      return res.status(403).send({
        code: 403,
        type: "ABSENCE",
        message: "Peserta tidak melalui presensi tahap pertama.",
      });
    }

    if (registration.isLastAttended) {
      return res.status(403).send({
        code: 403,
        type: "DOUBLE_PRESENCE",
        message: "Peserta sudah melalui presensi tahap kedua.",
      });
    }

    const markAttendance = await stateRegDB
      .query()
      .where({ stateID, nim })
      .update({ isLastAttended: true });

    if (!markAttendance) {
      return res.status(404).send({
        code: 404,
        message: "Tidak terdaftar pada state ini.",
      });
    }

    return res.status(200).send({
      code: 200,
      message: "Berhasil melakukan absensi.",
    });
  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

const readMabaSpecificReg = async (req, res) => {
  const validateNim = await nimValidator.safeParseAsync(req.params.nim);
  if (!validateNim.success) {
    return res.status(400).send({
      code: 400,
      message: "Validasi gagal.",
      error: validateNim.error,
    });
  }

  try {
    let result = await stateRegDB
      .query()
      .where({ "state_registration.nim": validateNim.data })
      .join("mahasiswa", "state_registration.nim", "=", "mahasiswa.nim")
      .join(
        "state_activities",
        "state_registration.stateID",
        "=",
        "state_activities.stateID"
      )
      .select(
        "state_registration.stateID",
        "mahasiswa.nim",
        "mahasiswa.token",
        "mahasiswa.name",
        "state_registration.created_at",
        "state_registration.attendanceTime",
        "state_registration.isFirstAttended",
        "state_registration.isLastAttended",
        "state_activities.name as stateName",
        "state_activities.day"
      );

    return res.status(200).send({
      code: 200,
      message: `Berhasil mendapatkan data pendaftaran STATE untuk nim : ${validateNim.data}`,
      data: result,
    });
  } catch (err) {
    return res.status(500).send({ code: 500, message: err.message });
  }
};

/*
NOTE untuk maba regis STATE (farel):
-   Maba maksimal regis 3 state (DONE)
-   Maba tidak bisa regis state yang ada di Day yang sama (DONE)
-   Maba tidak bisa regis state yang sudah penuh (DONE)
-   Maba bisa cancel state yang sudah di regis 

-   Terdapat toggle untuk mengatur batas waktu pendaftaran state.
    untuk pengecekan batas waktu toggle, terdapat middleware untuk 
    pendaftaran di toggle\middleware\toggle.middleware.js,
    tinggal pasang ae di route.

-   Fitur untuk maba:
    - daftar state
    - cancel state (DELETE)

-   Untuk daftar, request yng harus diisi ke database state_registration:
    - nim maba yang daftar (DONE)
    - stateID yang di daftar maba (DONE)

-   ketika maba daftar, maka value registered di database state yg didaftar maba
    akan bertambah 1. ketika maba cancel, maka value registered di database state -1

-   jika validasi data yang diinput ada banyak, bisa pakai zod biar gampang.
    kalau mau liat contoh ada di #discussion discord. atau klo  ada cara yang lebih 
    efisien, sabi dicobain.

NOTE untuk maba absen STATE:
-   Pastikan user telah punya token absensi
-   konsep simple utk absen:
    - maba punya qr (FE generate qr dari token yang diambil dari BE)
    - saat awal dan akhir, panitia akan scan qr milik maba (FE akan kirim token ke endpoint yg buat absen).
    - jika qr valid, maka maba akan diabsen. (BE menerima token dan mencari maba dengan token tersebut dan absen dah)

-   Terdapat toggle untuk mengatur batas waktu absen state.

-   Fitur untuk absen maba:
    - absen pertama
    - absen kedua

-   Absen pertama mengubah value attendanceTIME di database state_registration 
    menjadi waktu current time saat dia absen serta value isFirstAttended menjadi 1.

-   Absen kedua mengubah value isLastAttended menjadi 1.

*/

module.exports = {
  readAllReg,
  readSpecificReg,
  readStateRegByStateID,
  readStateRegByDay,
  updateRegData,
  deleteRegData,
  handleRegistration,
  cancelRegistration,
  handleFirstAttendance,
  handleLastAttendance,
  readMabaSpecificReg,
};
