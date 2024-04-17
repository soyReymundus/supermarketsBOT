/**
 * @description Archivo de utilidad encargado de proporcionar funciones para actualizar facilmente le precio de los productos.
 */

const supermarketsManager = require("./supermarkets");

/**
 * Actualizas los precios de todos los productos de un supermercado.
 * No es recomendable modificar time2Sleep porque corres el riesgo de superar el limite de velocidad.
 * @param {supermarketsManager.SuperMarket} supermarket El supermercado al cual se le actualizaran los precios.
 * @param {Boolean?} skipCheck Si es falso solo se actualizaran los precios que no esten cargados.
 * @param {Number?} time2Sleep Tiempre entre escaneo.
 * @param {Number?} maxRetries Maximos reintentos en caso de error.
 * @returns {Promise<void>}
 */
async function updateSupermarketPrices(supermarket, skipCheck = false, time2Sleep = 5000, maxRetries = 3) {
    for (let index = 0; index < supermarket["products"].length; index++) {
        const product = supermarket["products"][index];
        let links = product.links;

        for (let i = 0; i < links.length; i++) {
            const link = links[i];

            if (!skipCheck) {
                if (!!link.price) continue;
            };

            console.log("Lnk: " + link.link);
            console.log("Price Unde: " + link.price);

            for (let ii = 0; ii != maxRetries; ii++) {
                let retryIn = ii + 1;
                await sleep(time2Sleep * retryIn);

                try {
                    await link.getPrice();
                    break;
                } catch (e) {
                    continue;
                };
            };
        };
    };
};

/**
 * Actualizas los precios de todos los productos de todos los supermercados.
 * No es recomendable modificar time2Sleep porque corres el riesgo de superar el limite de velocidad.
 * @param {supermarketsManager.SuperMarkets} supermarkets Los supermercados a los cuales se les actualizaran los precios.
 * @param {Boolean?} skipCheck Si es falso solo se actualizaran los precios que no esten cargados.
 * @param {Number?} time2Sleep Tiempre entre escaneo.
 * @param {Number?} maxRetries Maximos reintentos en caso de error.
 * @returns {void}
 */
function updateSupermarketsPrices(supermarkets, skipCheck = false, time2Sleep = 7000, maxRetries = 5) {
    for (let index = 0; index < supermarkets["supermarkets"].length; index++) {
        let supermarket = supermarkets["supermarkets"][index];

        updateSupermarketPrices(supermarket, skipCheck, time2Sleep, maxRetries);
    };
};

function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
};

module.exports = {
    updateSupermarketPrices,
    updateSupermarketsPrices
};