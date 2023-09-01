const env = require("dotenv").config({ path: "../../.env" });
const External = require("../../malpun/model/external.model");
const MalpunTransaction = require("../../malpun/model/malpun_transaction.model");


const getAllPurchase = async (req, res) => {
    try {
        
        const purchases = await External.query()
            .select('external.*', 'malpun_transaction.status AS payment_status')
            .join('malpun_transaction', 'external.transactionID', '=', 'malpun_transaction.id')

        return res.status(200).send({
            code: 200,
            message: "Berhasil mendapatkan data pembelian tiket malam puncak.",
            data : purchases
        });            

    } catch(err){
        return res.status(500).send({
            code: 500,
            message: err.message,
          });        
    }
}

const getAllPaidPurchase = async (req, res) => {
    try {
        
        const purchases = await External.query()
            .join('malpun_transaction', 'external.transactionID', '=', 'malpun_transaction.id')
            .where('malpun_transaction.status', "=", 'settlement')

        return res.status(200).send({
            code: 200,
            message: "Berhasil mendapatkan data pembelian tiket malam puncak.",
            data : purchases
        });            

    } catch(err){
        return res.status(500).send({
            code: 500,
            message: err.message,
          });        
    }
}   


const getAllUnpaidPurchase = async (req, res) => {
    try {
        
        const purchases = await External.query()
            .join('malpun_transaction', 'external.transactionID', '=', 'malpun_transaction.id')
            .where('malpun_transaction.status', "!=", 'settlement')

        return res.status(200).send({
            code: 200,
            message: "Berhasil mendapatkan data pembelian tiket malam puncak.",
            data : purchases
        });            

    } catch(err){
        return res.status(500).send({
            code: 500,
            message: err.message,
          });        
    }
}   




module.exports = {
    getAllPurchase,
    getAllPaidPurchase,
    getAllUnpaidPurchase
}