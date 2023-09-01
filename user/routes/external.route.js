const externalController = require("../controller/external.controller");


module.exports = function (app) {

    app.post(
        "/api/external/register",
        externalController.registerexternal
    );
    
    // app.post(
    //     "/api/external/login", 
    //     externalController.loginexternal
    // );

    app.post(
        "/api/external/ticketCheckout", 
        externalController.ticketCheckout
    );    
}