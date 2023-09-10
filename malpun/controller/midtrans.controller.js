const env = require("dotenv").config({ path: "../../.env" });
const { midtransCore, midtransSnap } = require('../../config/midtrans');


const paymentCallback = async (req, res) => {
    console.log("__CALLBACK__");
    console.log(req.body);
    // wait for input alfagift ID
    // tanya ini API input alfagift sama sponsor pisah apa gabung
    const payload = req.body; 

    // paid
    if (transaction_status == 'settlement'){
        // edit payment status on db
        // send email to user (according to token)
    }


}

module.exports = {
    paymentCallback
}