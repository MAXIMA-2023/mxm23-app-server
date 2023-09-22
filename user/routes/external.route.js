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

    app.post(
        "/api/external/get_token", 
        externalController.getPaymentDetail
    );    

    app.get(
        "/api/malpun/get_tiket_by_token/:token", 
        externalController.getPaymentDetail
    );
}