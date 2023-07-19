const organisatorController = require("../controller/organisator.controller");
const middleware = require("../middleware/middleware");

module.exports = function (app) {
  app.post(
    "/api/organisator/register",
    organisatorController.registerOrganisator
  );
  app.post("/api/organisator/login", organisatorController.loginOrganisator);
  app.get(
    "/api/organisator/profile",
    middleware.verifyJWT,
    middleware.isOrganisator,
    organisatorController.getProfile
  );

  app.get(
    "/api/organisator/data",
    middleware.verifyJWT,
    middleware.isPanitia,
    organisatorController.getOrganisator
  );
  app.get(
    "/api/organisator/data/:nim",
    middleware.verifyJWT,
    middleware.isPanitia,
    organisatorController.getOrganisatorspesifik
  );

  app.put(
    "/api/organisator/data/:nim",
    middleware.verifyJWT,
    middleware.isPanitia,
    organisatorController.updateOrganisator
  );

  app.put(
    "/api/organisator/verifyAcc/:nim",
    middleware.verifyJWT,
    middleware.isPanitia,
    organisatorController.verifyAcc
  );

  app.delete(
    "/api/organisator/data/:nim",
    middleware.verifyJWT,
    middleware.isPanitia,
    organisatorController.getDelete
  );

  app.get(
    "/api/organisator/state/statistik/:stateID", 
    middleware.verifyJWT, 
    middleware.isOrganisator, 
    organisatorController.getStatistic
  );  
};
