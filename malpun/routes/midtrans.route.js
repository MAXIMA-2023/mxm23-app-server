const {
    paymentCallback
} = require('../controller/midtrans.controller');
const {
    verifyJWT,
    isPanitia,
    isMahasiswa,
  } = require("../../user/middleware/middleware");
const {
    ExternalBuyTicket,
    checkToggle
} = require('../../toggle/middleware/toggle.middleware')

module.exports = (app) => {
    app.post('/api/malpun/payment', 
    ExternalBuyTicket, 
    checkToggle,
    paymentCallback);
}