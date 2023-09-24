const toggleDB = require("../model/toggle.model");

//set toggleID jadi 1, buat aktif/nonaktifin apakah maba bisa daftar akun
exports.signUpMahasiswa = async (req, res, next) => {
  req.toggleID = 1;
  next();
};

//set toggleID jadi 2, buat aktif/nonaktifin apakah maba bisa daftar state
exports.createState = async (req, res, next) => {
  req.toggleID = 2;
  next();
};

//set toggleID jadi 3, buat aktif/nonaktifin apakah organisator/panitia bisa update state
exports.updateState = async (req, res, next) => {
  req.toggleID = 3;
  next();
};

//set toggleID jadi 4, buat aktif/nonaktifin apakah organisator/panitia bisa hapus state
exports.deleteState = async (req, res, next) => {
  req.toggleID = 4;
  next();
};

//set toggleID jadi 5, buat aktif/nonaktifin apakah maba bisa daftar state
exports.stateRegistration = async (req, res, next) => {
  req.toggleID = 5;
  next();
};

//set toggleID jadi 6, buat mastiin tidak ada yang absen di luar waktu yang ditentukan
exports.presensi = async (req, res, next) => {
  req.toggleID = 6;
  next();
};

exports.homePage = async (req, res, next) => {
  req.toggleID = 7;
  next();
};

exports.statepage = async (req, res, next) => {
  req.toggleID = 8;
  next();
};

exports.malpunpage = async (req, res, next) => {
  req.toggleID = 9;
  next();
};

exports.MabaClaimTicket = async (req, res, next) => {
  req.toggleID = 10;
  next();
};

exports.ExternalBuyTicket = async (req, res, next) => {
  req.toggleID = 11;
  next();
};

// dari value toggleID yang diset, akan dicek disini apakah aktif atau nonaktif
exports.checkToggle = async (req, res, next) => {
  try {
    const toggleID = req.toggleID;

    const dbToggle = await toggleDB.query().where({ id: toggleID });
    if (dbToggle[0].toggle === 0) {
      return res.status(409).send({
        message: "Permintaan ditolak karena sudah melewati batas waktu!",
      });
    }
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: err.message,
    });
  }
};
