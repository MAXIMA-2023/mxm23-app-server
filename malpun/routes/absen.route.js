const absenController = require("../controller/absen.controller");
const middleware = require("../../user/middleware/middleware");

module.exports = (app) => {
  app.post(
    "/api/malpun/absen/",
    middleware.verifyJWT,
    middleware.isPanitia,
    absenController.absenmalpun
  );

  // app.put(
  //     '/api/absenexternal/:nim',
  //     absenController.absenmalpunexternal
  // )
};
