const authController = require("../controller/auth.controller");

module.exports = function (app) {
  app.post("/api/internal/login", authController.loginpanitorganisator);
};
