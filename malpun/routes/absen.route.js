const absenController = require("../controller/absen.controller");
const middleware = require("../../user/middleware/middleware");

module.exports = (app) => {
  app.post(
    "/api/malpun/absen/",
    // middleware.verifyJWT,
    // middleware.isPanitia,
    absenController.absenmalpun
  );

  app.get(
    "/api/malpun/data/:token",
    // middleware.verifyJWT,
    // middleware.isPanitia,
    absenController.getMalpunDataByToken
  )
};
