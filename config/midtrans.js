
const env = require('dotenv').config({path : '../.env'});
const midtransClient = require('midtrans-client');


const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;


const midtransCore = new midtransClient.CoreApi({
    isProduction : process.env.NODE_ENV == 'production' ? true : false, 
    clientKey : CLIENT_KEY,
    serverKey : SERVER_KEY
})

const midtransSnap = new midtransClient.Snap({
    isProduction : process.env.NODE_ENV == 'production' ? true : false, 
    clientKey : CLIENT_KEY,
    serverKey : SERVER_KEY
})

module.exports = { midtransCore, midtransSnap };