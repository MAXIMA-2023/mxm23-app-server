const ticketController= require("../controller/ticket.controller");
const middleware = require('../../user/middleware/middleware')
const toggle = require('../../toggle/middleware/toggle.middleware')

module.exports = (app) => {
  app.post(
    '/api/mahasiswa/malpun/claimticket',
    toggle.MabaClaimTicket, toggle.checkToggle,
    middleware.verifyJWT,
    ticketController.sendEmail
  );

  app.put(
    '/api/mahasiswa/malpun/update/alfagift',
    middleware.verifyJWT,
    ticketController.updateAlphagift
  );

  app.get(
    '/api/malpun/mabatiket/data',
    middleware.verifyJWT,
    middleware.isPanitia,
    ticketController.mabamalpunlist
  );
  
  // app.get(
  //   '/api/malpun/mabatiket/claim',
  //   ticketController.ResendEmail
  // )
};