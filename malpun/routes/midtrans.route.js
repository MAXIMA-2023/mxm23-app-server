const {
    paymentCallback
} = require('../controller/midtrans.controller');
const {
    verifyJWT,
    isPanitia,
    isMahasiswa,
  } = require("../../user/middleware/middleware");


module.exports = (app) => {
    app.post('/api/mahasiswa/malpun/payment', paymentCallback);
}