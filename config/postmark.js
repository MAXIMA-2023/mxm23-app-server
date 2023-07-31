const env = require('dotenv').config({path : "../.env"});
const postmark = require('postmark');

const API_TOKEN = process.env.POSTMARK_API_TOKEN;

const client = new postmark.ServerClient(API_TOKEN);

module.exports = client;