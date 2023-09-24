const postmark = require("postmark");

const API_TOKEN = process.env.POSTMARK_API_TOKEN;

if (!global.postmarkClient) {
  global.postmarkClient = new postmark.ServerClient(API_TOKEN);
}

module.exports = global.postmarkClient;
