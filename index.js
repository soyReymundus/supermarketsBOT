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
const fs = require("fs");

let basicFoodBasketJSON = JSON.parse(fs.readFileSync("supermarkets/basicFoodBasket.json"));
let basicFoodBasket = new supermarketsManager.SuperMarkets(basicFoodBasketJSON);

setTimeout(() => {
    intervals.updateSupermarketsPrices(basicFoodBasket, false, 15000);
}, 3600000 / 12);

setInterval(() => {
    intervals.updateSupermarketsPrices(basicFoodBasket, true);
}, 3600000 * 1.5);

//Cierre semanal y diario del promedio de la canasta basica.
var lastClosing = 0;
setInterval(() => {
    let now = new Date();
    let date;
    let oldBasicFoodBasket;
    //
    if (now.getHours() != 22) return;
    if (now.getDay() == 6) return;
    if (lastClosing == now.getDate());

    if (now.getDay() == 7) {
        let pastWeek = new Date(Date.now() - 604800000);
        let formatedDate = String(pastWeek.getDate()).padStart(2, '0') + "-" + String(pastWeek.getMonth() + 1).padStart(2, '0') + "-" + pastWeek.getFullYear();

        date = "semana";
        oldBasicFoodBasket = new supermarketsManager.SuperMarkets(reports.get("basicFoodBasket", formatedDate));
    } else {
        date = "dia";
        oldBasicFoodBasket = new supermarketsManager.SuperMarkets(reports.get("basicFoodBasket"));
    };

    let average = basicFoodBasket.totalAverages();
    let oldAverage = oldBasicFoodBasket.totalAverages();

    let difference = operations.getPercentage(oldAverage, average);

    BotsManager.publishAveragePercentagePrices("la canasta basica alimentaria", difference, basicFoodBasket.getNames(), "dia");

    lastClosing = now.getDate();
    reports.create(report, "basicFoodBasket");
}, 15000);

//Actualizacion de precios por hora 
var lastAveragesPrice = 0;
var lastMedianPrice = 0;
setTimeout(() => {
    setInterval(() => {
        if (!lastMedianPrice) return lastMedianPrice = basicFoodBasket.totalMedian();
        if (!lastAveragesPrice) return lastAveragesPrice = basicFoodBasket.totalAverages();

        let medianPrice = basicFoodBasket.totalMedian();
        let averagePrice = basicFoodBasket.totalAverages();

        if (averagePrice == lastAveragesPrice) return;

        BotsManager.publishVariationOfPrices("la canasta basica alimentaria", lastAveragesPrice, averagePrice, medianPrice, basicFoodBasket.getNames(), "hora");

        lastMedianPrice = medianPrice;
        lastAveragesPrice = averagePrice;
    }, 3600000);
}, 3600000);