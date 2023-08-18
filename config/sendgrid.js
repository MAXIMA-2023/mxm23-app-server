const env = require('dotenv').config({path : "../.env"});
const client = require('@sendgrid/mail');
client.setApiKey(process.env.SENDGRID_API_TOKEN);

module.exports = client;