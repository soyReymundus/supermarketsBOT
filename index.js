require('dotenv').config();
const { TwitterApi } = require("twitter-api-v2");

const twitterClient = new TwitterApi({
    "accessSecret": process.env["AccessTokenSecret"],
    "accessToken": process.env["AccessToken"],
    "appKey": process.env["APIKey"],
    "appSecret": process.env["APIKeySecret"],
    "clientId": process.env["ClientID"],
    "clientSecret": process.env["ClientSecret"]
});
//const twitterClient = twitterClient.readWrite;




