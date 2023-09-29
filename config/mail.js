const nodemailer = require("nodemailer");

const service = process.env.MAIL_SERVICE;
const host = process.env.MAIL_HOST;
const port = process.env.MAIL_PORT;
const user = process.env.MAIL_ACCOUNT;
const pass = process.env.MAIL_PASSWORD;
const clientID = process.env.OAUTH_CLIENTID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;
const refreshToken = process.env.OAUTH_REFRESH_TOKEN;

if (!global.transporter) {
  try {
    global.transporter = nodemailer.createTransport({
      host,
      service: 'gmail', // or use 'host' and 'port' if not using Gmail
      auth: {
        type: 'OAuth2',
        user: user,
        pass: pass,
        clientId: clientID,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
      }
    });
  } catch (error) {
    console.error("Error creating nodemailer transporter:", error);
  }
}

module.exports = global.transporter;
