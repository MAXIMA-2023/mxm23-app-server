const {
    getAllPurchase,
    getAllPaidPurchase,
    getAllUnpaidPurchase
} = require('../controller/data.controller');
const {
    verifyJWT,
    isPanitia,
    isMahasiswa,
  } = require("../../user/middleware/middleware");

module.exports = (app) => {

    app.get("/api/malpun/purchase",
        verifyJWT, 
        isPanitia,
        getAllPurchase
    );    

    app.get("/api/malpun/purchase/paid",
        verifyJWT, 
        isPanitia,
        getAllPaidPurchase
    );

    app.get("/api/malpun/purchase/unpaid",
        verifyJWT, 
        isPanitia,
        getAllUnpaidPurchase
    );    
}