const PanitController = require("../controller/panitia.controller");
// const validation = require('../validation/validate')
const middleware = require("../middleware/middleware");
// const toggle = require('../../toggle/middleware/toggle.middleware')

module.exports = function (app) {
  app.post("/api/panit/register", PanitController.register);

  app.post("/api/panit/login", PanitController.login);

  app.get(
    "/api/panit/profile",
    middleware.verifyJWT,
    middleware.isPanitia,
    PanitController.getProfile
  );

  app.get(
    "/api/panit/data",
    middleware.verifyJWT,
    middleware.isPanitia,
    PanitController.readAllData
  );

  app.get(
    "/api/panit/data/:nim",
    middleware.verifyJWT,
    middleware.isPanitia,
    PanitController.readSpecificData
  );

  app.put(
    "/api/panit/data/:nim",
    middleware.verifyJWT,
    middleware.isPanitia,
    PanitController.updateData
  );

  app.put(
    "/api/panit/verifyAcc/:nim",
    middleware.verifyJWT,
    middleware.isPanitia,
    PanitController.verifyAcc
  );

  app.delete(
    "/api/panit/data/:nim",
    middleware.verifyJWT,
    middleware.isPanitia,
    PanitController.deleteData
  );
};
