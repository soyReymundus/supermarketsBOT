/**
 * @description Archivo de utilidad encargado de proporcionar distintas funciones para publicar en redes sociales.
 */

const twitter = require("./twitter.js");
const discord = require("./discord.js");

/**
 * Publicas la variacion de precios en terminos porcentuales de un conjunto de productos.
 * Esto se propagara por todos los BOTs!
 * @param {String} name El nombre del conjunto de producto.
 * @param {Number} rawPercentage La variacion porcentual.
 * @param {String | String[]} rawSource La fuente/s de informacion.
 * @param {String?} date El periodo de tiempo de la variacion.
 */
function publishAveragePercentagePrices(name, rawPercentage, rawSource, date) {
    return new Promise(async (resolve, reject) => {
        twitter.publishAveragePercentagePrices(name, rawPercentage, rawSource, date);
        discord.publishAveragePercentagePrices(name, rawPercentage, rawSource, date);
        resolve();
    });
};

/**
 * Publicas los precios que mas bajon o subieron en un periodo de tiempo.
 * Esto se propagara por todos los BOTs!
 * @param {{product: String, percentage: String | Number}[]} prices La variacionde precios.
 * @param {Boolean} inflation Si es verdadero significa que la variacion fue positiva. Por defecto es verdadero.
 * @param {String | String[]} rawSource La fuente/s de informacion.
 * @param {String?} date El periodo de tiempo de la variacion.
 */
function publishTopPrices(prices, inflation = true, rawSource, date) {
    return new Promise(async (resolve, reject) => {
        twitter.publishTopPrices(prices, inflation = true, rawSource, date);
        resolve();
    });
};

/**
 * Publicas la variacion de precios en todas las redes sociales.
 * @param {String} name El nombre del conjunto de productos.
 * @param {Number} oldAveragesPrice La variacion porcentual.
 * @param {Number} newAveragesPrice La variacion porcentual.
 * @param {Number} median La mediana actual.
 * @param {String | String[]} rawSource La fuente/s de informacion.
 * @param {String?} date El periodo de tiempo de la variacion.
 */
function publishVariationOfPrices(name, oldAveragesPrice, newAveragesPrice, median, rawSource, date) {
    return new Promise(async (resolve, reject) => {
        twitter.publishVariationOfPrices(prices, inflation = true, rawSource, date);
        discord.publishVariationOfPrices(prices, inflation = true, rawSource, date);
        resolve();
    });
};

/**
 * Modulo que proporciona distintas funciones para publicar en redes sociales.
 */
module.exports = {
    publishAveragePercentagePrices,
    publishVariationOfPrices
    //publishTopPrices
};