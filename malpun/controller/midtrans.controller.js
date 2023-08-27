const env = require("dotenv").config({ path: "../../.env" });
const { midtransCore, midtransSnap } = require('../../config/midtrans');


const paymentCallback = async (req, res) => {
    console.log("___WEBHOOK MIDTRANS___");
    console.log(req.body);
}

module.exports = {
    paymentCallback
}