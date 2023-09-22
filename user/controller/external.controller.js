const env = require("dotenv").config({ path: "../../.env" });
const randomToken = require("random-token");
const { Model } = require("objection");
const External = require("../../malpun/model/external.model");
const MalpunTransaction = require("../../malpun/model/malpun_transaction.model");
const { midtransCore, midtransSnap } = require("../../config/midtrans");
const { registerValidator } = require("../validation/external.validation");
const { MidtransError } = require("midtrans-client");

const registerexternal = async (req, res) => {
 
  try {
    Model.transaction(async trx => {

      const validateBody = await registerValidator.safeParseAsync(req.body);

      const transactionID = randomToken(32);
      // const token = "MXM23-" + randomToken(32);
  
      if (!validateBody.success) {
        return res.status(400).send({
          code: 400,
          message: "Validasi gagal.",
          error: validateBody.error,
        });
      }
  
      const transactionData = await MalpunTransaction.query().insert({
        id: transactionID,
        status: null,
      });
  
      const externalData = await External.query().insert({
        ...validateBody.data,
        transactionID,
        // token,
      });
  
      // midtrans snap token exchange
      // nanti kasitau frontend buat siap2in midtrans di FE nya yg
      // nyimpen tombol bwt call API ini 


      const body = {
        transaction_details: {
          // order_id: transaction_id,
          order_id : transactionID,
          gross_amount: 35000, // harga tiket malpun
        },
        credit_card: {
          secure: true,
        },
        item_details: [
          {
            id: "MXM23-MALPUN-TICKET",
            price: 35000,
            quantity: 1,
            name: "Tiket Malam Puncak MAXIMA UMN 2023",
          },
        ],
        // TESTER
        customer_details: externalData
      };
  
      const token = await midtransSnap.createTransactionToken(body);      
  
      return res.status(201).send({
        code: 201,
        message: "Pendaftaran berhasil.",
        data : {...externalData, transaction_id : transactionID, token}  // tokennya disimpen di state frontend
      });
    }).catch (err => {
      console.error(err);
      return res.status(500).send({
        code: 500,
        message: err.message,
      });      
    }) 


  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

const ticketCheckout = async (req, res) => {
  // SAMPLE ROUTE FOR TESTING

  // kirimin transaction_id aja

  const { transaction_id = '' } = req.body;
  
  try {

    const externalAccount = await External.query()
      .join('malpun_transaction', 'external.transactionID', '=', 'malpun_transaction.id')
      // .where('malpun_transaction.id', transaction_id)
      .where('malpun_transaction.id', transaction_id)
      .first();


    if (!externalAccount) {
        return res.status(404).json({
          code : 404,
          error : "INVALID_TRANSACTION_ID",
          message: "Identitas akun tidak ditemukan.",
        });      
    }

    const body = {
      transaction_details: {
        // order_id: transaction_id,
        order_id : transaction_id,
        gross_amount: 75000, // harga tiket malpun
      },
      credit_card: {
        secure: true,
      },
      item_details: [
        {
          id: "MXM23-MALPUN-TICKET",
          price: 75000,
          quantity: 1,
          name: "Tiket Malam Puncak MAXIMA UMN 2023",
        },
      ],
      // TESTER
      customer_details: externalAccount
    };

    const token = await midtransSnap.createTransactionToken(body);
  
    return res.status(200).json({
      status: "SUCCESS",
      code: 200,
      message: "Transaction token exchanged successfully",
      token,    
    })


  } catch (err) {
    console.error(err);

    if (err instanceof MidtransError){
      return res.status(409).send({
        code: 409,
        message: "ID transaksi tidak valid."
      });      
    }

    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
}; 


const getPaymentDetail = async (req, res) => {
  try {

    const { order_id = '' } = req.body; 

    const externalAccount = await External.query()
      .where('transactionID', order_id)
      .first();    


    if (!externalAccount){
      return res.status(404).json({
        status: "FAIL",
        code: 404,
        message: "Tidak menemukan riwayat pembayaran. Silahkan kontak admin MAXIMA untuk penanganan lebih lanjut.",
      })        
    }


    return res.status(200).json({
        status: "SUCCESS",
        code: 200,
        message: "Berhasil mendapatkan data external",
        data : externalAccount
    })      


  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
}



const getPaymentDetailByToken = async (req, res) => {
  try {

    const { token = '' } = req.params;

    const internalAccount = await Mahasiswa.query()
      .where('token', token)
      .first();    

    if (internalAccount){
        return res.status(200).json({
          status: "SUCCESS",
          code: 200,
          message: "Berhasil mendapatkan data external",
          data : {isInternal : true, ...internalAccount}
      })        
    }

    const externalAccount = await External.query()
      .where('token', token)
      .first();    


    if (!externalAccount){
      return res.status(404).json({
        status: "FAIL",
        code: 404,
        message: "Tidak menemukan riwayat pembayaran. Silahkan kontak admin MAXIMA untuk penanganan lebih lanjut.",
      })        
    }    


    return res.status(200).json({
        status: "SUCCESS",
        code: 200,
        message: "Berhasil mendapatkan data external",
        data : {isInternal : false, ...externalAccount}
    })      


  } catch (err) {
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
}


module.exports = {
  ticketCheckout,
  registerexternal,
  getPaymentDetail, 
  getPaymentDetailByToken
};
