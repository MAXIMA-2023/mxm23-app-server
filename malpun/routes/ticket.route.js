const ticketController= require("../controller/ticket.controller");
const middleware = require('../../user/middleware/middleware')

module.exports = (app) => {
  app.post(
    '/api/mahasiswa/malpun/claimticket',
    middleware.verifyJWT,
    ticketController.sendEmail
  );

  app.put(
    '/api/mahasiswa/malpun/update/alfagift',
    middleware.verifyJWT,
    ticketController.updateAlphagift
  );
};