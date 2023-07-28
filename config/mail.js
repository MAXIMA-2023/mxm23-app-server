const env = require('dotenv').config({path : '../.env'});
const nodemailer = require('nodemailer');

const service = process.env.MAIL_SERVICE;
const host = process.env.MAIL_HOST;
const port = process.env.MAIL_PORT;
const user = process.env.MAIL_ACCOUNT;
const pass = process.env.MAIL_PASSWORD;

const mailConfig = nodemailer.createTransport({
    host,
    service,
    auth : {user, pass}
});

module.exports = mailConfig;