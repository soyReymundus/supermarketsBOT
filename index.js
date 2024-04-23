process.on("uncaughtException", (exception) => {
    process.report.writeReport(exception);
    process.exit(1);
});
require('dotenv').config();

const BotsManager = require("./util/botsManagers/botsManagers.js");
const supermarketsManager = require("./util/supermarkets.js");
const operations = require("./util/operations.js");
const intervals = require("./util/intervals.js");
const reports = require("./util/reports.js");
const api = require("./api.js");
const https = require("https");
const fs = require("fs");

const certificate = fs.readFileSync('./cert/fullchain.pem', 'utf8');
const privateKey = fs.readFileSync('./cert/privkey.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, api);

httpsServer.listen(443);

let basicFoodBasketJSON = JSON.parse(fs.readFileSync("supermarkets/basicFoodBasket.json"));
let basicFoodBasket = new supermarketsManager.SuperMarkets(basicFoodBasketJSON);

setTimeout(() => {
    intervals.updateSupermarketsPrices(basicFoodBasket, false, 10000, 5);
}, 3600000 / 12);

setTimeout(() => {
    intervals.updateSupermarketsPrices(basicFoodBasket, false, 10000, 5);
}, 3600000);

setInterval(() => {
    intervals.updateSupermarketsPrices(basicFoodBasket, true);
}, 3600000 * 1.5);

//Cierre semanal y diario del promedio de la canasta basica.
var lastClosing = 0;
var lastAveragesPrice = 0;
var lastMedianPrice = 0;

setInterval(() => {
    let now = new Date();

    if (now.getHours() != 22) return;
    if (lastClosing == now.getDate()) return;
    lastClosing = now.getDate();

    let average = basicFoodBasket.getProductsAverage();

    lastMedianPrice = operations.getAverage(basicFoodBasket.getAllProductsAverage());;
    lastAveragesPrice = average;

    if (now.getDay() != 6) {
        let date;
        let oldBasicFoodBasket;

        if (now.getDay() == 0) {
            let pastWeek = new Date(Date.now() - 604800000);
            let formatedDate = String(pastWeek.getDate()).padStart(2, '0') + "-" + String(pastWeek.getMonth() + 1).padStart(2, '0') + "-" + pastWeek.getFullYear();

            date = "semana";
            oldBasicFoodBasket = new supermarketsManager.SuperMarkets(reports.get("basicFoodBasket", formatedDate));
        } else {
            date = "dia";
            oldBasicFoodBasket = new supermarketsManager.SuperMarkets(reports.get("basicFoodBasket"));
        };

        let oldAverage = oldBasicFoodBasket.getProductsAverage();
        let difference = operations.getPercentage(oldAverage, average);
        BotsManager.publishAveragePercentagePrices("la canasta basica alimentaria", difference, basicFoodBasket.getNames(), date);
    };

    reports.create(basicFoodBasket.toJSON(), "basicFoodBasket");
}, 15000);

//Actualizacion de precios por hora 
setTimeout(() => {
    setInterval(() => {
        let now = new Date();

        if (!lastMedianPrice) return lastMedianPrice = operations.getAverage(basicFoodBasket.getAllProductsAverage());
        if (!lastAveragesPrice) return lastAveragesPrice = basicFoodBasket.getProductsAverage();
        if (now.getDay() == 6 || now.getDay() == 0) return;
        if (now.getHours() < 8 || now.getHours() > 21) return;

        let medianPrice = operations.getMedian(basicFoodBasket.getAllProductsAverage());
        let averagePrice = basicFoodBasket.getProductsAverage();

        if (averagePrice == lastAveragesPrice) return;

        BotsManager.publishVariationOfPrices("la canasta basica alimentaria", lastAveragesPrice, averagePrice, medianPrice, basicFoodBasket.getNames());

        lastMedianPrice = medianPrice;
        lastAveragesPrice = averagePrice;
    }, 3600000 / 6);
}, 3600000 * 1.5);