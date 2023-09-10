const env = require("dotenv").config({ path: "../../.env" });
const randomToken = require("random-token");
const { Model } = require("objection");
const External = require("../../malpun/model/external.model");
const MalpunTransaction = require("../../malpun/model/malpun_transaction.model");
const { midtransCore, midtransSnap } = require('../../config/midtrans');
const { registerValidator } = require('../validation/external.validation')

const registerexternal = async (req, res) => {
    const transaction = await Model.startTransaction();    
    try {
        const validateBody = await registerValidator.safeParseAsync(req.body);

        const transactionID = randomToken(32);
        const token = "MXM23-" + randomToken(32);
    
        if (!validateBody.success) {
          return res.status(400).send({
            code: 400,
            message: "Validasi gagal.",
            error: validateBody.error,
          });
        }
        console.log(External, 'e'), 
        console.log(MalpunTransaction);
        const transactionData = await MalpunTransaction.query()
            .insert({
                id : transactionID, 
                status : null
            });
    
        const externalData = await External.query()
            .insert({
                ...validateBody.data,
                transactionID, 
                token
            });


        // midtrans snap token exchange
        // nanti kasitau frontend buat siap2in midtrans di FE nya yg
        // nyimpen tombol bwt call API ini
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
          "customer_details": validateBody.data                
        }     

    
          midtransSnap.createTransactionToken(body)
            .then(async token => { 
    
                return res.status(200).json({
                    status : 'SUCCESS', 
                    code : 200, 
                    message : 'Transaction token exchanged successfully',
                    token, 
                });
            });            

        await transaction.commit();

        return res.status(201).send({
            code: 201,
            message: "Pendaftaran berhasil.",
        });        

    } catch (err){
        await transaction.rollback();        
        return res.status(500).send({
            code: 500,
            message: err.message,
          });
    }

}


const ticketCheckout = async (req, res) => {
    // SAMPLE ROUTE FOR TESTING
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
    ticketCheckout, 
    registerexternal
}