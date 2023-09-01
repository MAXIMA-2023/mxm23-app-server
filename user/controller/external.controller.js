const env = require("dotenv").config({ path: "../../.env" });
const randomToken = require("random-token");
const { Model } = require("objection");
const { midtransCore, midtransSnap } = require('../../config/midtrans');

const ticketCheckout = async (req, res) => {

    // if external data inputs are valid then enable midtrans modal
    try {
      const transactionTokenExchangeURL = process.env.MIDTRANS_TRANSACTION_TOKEN_URL;
      const serverKey = process.env.MIDTRANS_SERVER_KEY;  
  
      const orderID = randomToken(32);
  
      const body = {
        "transaction_details": {
            "order_id" : orderID,
            "gross_amount": 20000 // harga tiket malpun
        },
        "credit_card":{
            "secure" : true
        },
        "item_details": [{
            "id": "MXM23-MALPUN-TICKET",
            "price": 20000,
            "quantity": 1,
            "name": "Tiket Malam Puncak MAXIMA UMN 2023"
        }],       
      }     
        // "customer_details": {
        //     "username" : req.userAcc.username,
        //     "email": req.userAcc.email,
        // }
  
        midtransSnap.createTransactionToken(body)
          .then(async token => { 
  
              return res.status(200).json({
                  status : 'SUCCESS', 
                  code : 200, 
                  message : 'Transaction token exchanged successfully',
                  token, 
              });
          });    
       
    } catch (err){
      return res.status(500).send({
        code: 500,
        message: err.message,
      });
    }
  
  }

module.exports = {
    ticketCheckout
}