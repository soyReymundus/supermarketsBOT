/**
 * @description Archivo de utilidad encargado de proporcionar distintas funciones para publicar en Twitter.
 */
const operations = require("../operations.js");
const { TwitterApi } = require("twitter-api-v2");

const twitterClient = new TwitterApi({
    "accessSecret": process.env["AccessTokenSecret"],
    "accessToken": process.env["AccessToken"],
    "appKey": process.env["APIKey"],
    "appSecret": process.env["APIKeySecret"],
    "clientId": process.env["ClientID"],
    "clientSecret": process.env["ClientSecret"]
});

/**
 * Publicas la variacion de precios en terminos porcentuales de un conjunto de productos.
 * @param {String} name El nombre del conjunto de productos.
 * @param {Number} rawPercentage La variacion porcentual.
 * @param {String | String[]} rawSource La fuente/s de informacion.
 * @param {String?} date El periodo de tiempo de la variacion.
 */
function publishAveragePercentagePrices(name, rawPercentage, rawSource, date) {
    return new Promise(async (resolve, reject) => {
        try {
            let originalTweet = "";
            let percentage = (rawPercentage * 100).toFixed(2);
            let source = "";

            if (rawPercentage > 0) {
                originalTweet = `El precio de ${name} tuvo una variacion positiva de un ${percentage}%`;
            } else if (rawPercentage < 0) {
                originalTweet = `El precio de ${name} tuvo una variacion negativa de un ${percentage}%`;
            } else {
                originalTweet = `El precio de ${name} no tuvo variacion`;
            };

            if (!date) {
                originalTweet += ".";
            } else {
                originalTweet += ` este/a ${date}.`
            };

            let twett = await twitterClient.v2.tweet(originalTweet);

            if (Array.isArray(rawSource)) {
                for (let index = 0; index < rawSource.length; index++) {
                    const rawSrc = rawSource[index];

                    if (0 == index) {
                        source += rawSrc;
                    } else if (rawSource.length == index + 1) {
                        source += " y " + rawSrc;
                    } else {
                        source += ", " + rawSrc;
                    };
                };
            } else {
                source = rawSource;
            };

            twitterClient.v2.reply(`Fuentes: ${source}`, twett.data.id);
            resolve();
        } catch (e) {
            reject(e);
        };
    });
};

/**
 * Publicas los precios que mas bajon o subieron en un periodo de tiempo.
 * @param {{product: String, percentage: Number}[]} prices La variacionde precios.
 * @param {Boolean} inflation Si es verdadero significa que la variacion fue positiva. Por defecto es verdadero.
 * @param {String | String[]} rawSource La fuente/s de informacion.
 * @param {String?} date El periodo de tiempo de la variacion.
 */
function publishTopPrices(prices, inflation = true, rawSource, date) {
    return new Promise(async (resolve, reject) => {
        try {
            let originalTweet = "";
            let source = "";

            if (prices.length == 0) {
                if (inflation) {
                    originalTweet = `No han aumentado los precios este/a ${date} :)`;
                } else {
                    originalTweet = `No se han reducido los precios este/a ${date} :(`;
                };
            } else {
                if (inflation) {
                    originalTweet = `Los precios que mas aumentaron este/a ${date} son:`;
                } else {
                    originalTweet = `Los precios que mas se redujeron este/a ${date} son:`;
                };

                for (let index = 0; index < prices.length; index++) {
                    const price = prices[index];
                    let percentage = (price.percentage * 100).toString();

                    if (inflation) {
                        originalTweet += `\n${price.product} ${percentage}%`;
                    } else {
                        originalTweet += `\n${price.product} ${percentage}%`;
                    };
                };
            };

            let twett = await twitterClient.v2.tweet(originalTweet);

            if (Array.isArray(rawSource)) {
                source = rawSource.join("/");
            } else {
                source = rawSource;
            };

            twitterClient.v2.reply(`Fuentes: ${source}`, twett.data.id);
            resolve();
        } catch (e) {
            reject(e);
        };
    });
};

/**
 * Publicas la variacion de precios.
 * @param {String} name El nombre del conjunto de productos.
 * @param {Number} oldAveragesPrice La variacion porcentual.
 * @param {Number} newAveragesPrice La variacion porcentual.
 * @param {Number} median La mediana actual.
 * @param {String | String[]} rawSource La fuente/s de informacion.
 * @param {String?} date El periodo de tiempo de la variacion.
 */
function publishVariationOfPrices(name, oldAveragesPrice, newAveragesPrice, median, rawSource, date) {
    return new Promise(async (resolve, reject) => {
        try {
            let originalTweet = "";
            let percentage = (operations.getPercentage(oldAveragesPrice, newAveragesPrice) * 100).toFixed(2);
            let source = "";

            if (oldAveragesPrice > newAveragesPrice) {
                originalTweet = `El precio de ${name} tuvo una variacion negativa de un ${percentage}% %FECHA%.\nEl precio promedio acutal es de: ${newAveragesPrice}\nEl precio mediano acutal es de: ${median}`;
            } else if (oldAveragesPrice < newAveragesPrice) {
                originalTweet = `El precio de ${name} tuvo una variacion negativa de un ${percentage}% %FECHA%.\nEl precio promedio acutal es de: ${newAveragesPrice}\nEl precio mediano acutal es de: ${median}`;
            } else {
                originalTweet = `El precio de ${name} no tuvo variacion %FECHA%.\nEl precio promedio acutal es de: ${newAveragesPrice}\nEl precio mediano acutal es de: ${median}`;
            };

            if (!date) {
                originalTweet.replace(" %FECHA%", "");
            } else {
                originalTweet.replace("%FECHA%", `este/a ${date}`);
            };

            let twett = await twitterClient.v2.tweet(originalTweet);

            if (Array.isArray(rawSource)) {
                for (let index = 0; index < rawSource.length; index++) {
                    const rawSrc = rawSource[index];

                    if (0 == index) {
                        source += rawSrc;
                    } else if (rawSource.length == index + 1) {
                        source += " y " + rawSrc;
                    } else {
                        source += ", " + rawSrc;
                    };
                };
            } else {
                source = rawSource;
            };

            twitterClient.v2.reply(`Fuentes: ${source}`, twett.data.id);
            resolve();
        } catch (e) {
            reject(e);
        };
    });
};

/**
 * Modulo que proporciona distintas funciones para publicar en Twitter.
 */
module.exports = {
    publishAveragePercentagePrices,
    publishVariationOfPrices,
    publishTopPrices
};