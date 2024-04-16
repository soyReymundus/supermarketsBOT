/**
 * @description Archivo de utilidad encargado de proporcionar funciones para actualizar facilmente le precio de los productos.
 */

const supermarketsManager = require("./supermarkets");

/**
 * Actualizas los precios de todos los productos de un supermercado.
 * No es recomendable modificar time2Sleep porque corres el riesgo de superar el limite de velocidad.
 * @param {supermarketsManager.SuperMarket} supermarket 
 * @param {Boolean?} skipCheck 
 * @param {Number?} time2Sleep 
 * @returns {Promise<void>}
 */
async function updateSupermarketPrices(supermarket, skipCheck = false, time2Sleep = 7000) {
    for (let index = 0; index < supermarket["products"].length; index++) {
        const product = supermarket["products"][index];
        let links = product.links;

        for (let index = 0; index < links.length; index++) {
            const link = links[index];

            if (!skipCheck) {
                if (!!link.price) continue;
            };

            await sleep(time2Sleep);

            try {
                await link.getPrice();
            } catch (e) {

            };
        };
    };
};

/**
 * Actualizas los precios de todos los productos de todos los supermercados.
 * No es recomendable modificar time2Sleep porque corres el riesgo de superar el limite de velocidad.
 * @param {supermarketsManager.SuperMarkets} supermarkets 
 * @param {Boolean?} skipCheck 
 * @param {Number?} time2Sleep 
 * @returns {void}
 */
function updateSupermarketsPrices(supermarkets, skipCheck = false, time2Sleep = 7000) {
    for (let index = 0; index < supermarkets["supermarkets"].length; index++) {
        let supermarket = supermarkets["supermarkets"][index];

        updateSupermarketPrices(supermarket, skipCheck, time2Sleep);
    };
};

function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
};

module.exports = {
    updateSupermarketPrices,
    updateSupermarketsPrices
};