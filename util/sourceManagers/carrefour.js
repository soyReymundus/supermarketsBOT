/**
 * @description Archivo de utilidad encargado de proporcionar informacion obtenida del sitio web de Carrefour.
 */

/**
 * Modulo que proporciona informacion obtenida del sitio web de Carrefour.
 */
module.exports = {
    getPrice
};

/**
 * Escaneas la fuente de informacion en busca del precio.
 * @param {String} link El link de donde se extraera la informacion requerida.
 * @returns {Promise<Number>}
 */
function getPrice(link) {
    return new Promise((resolve, reject) => {
        if (typeof link != "string") return reject(new Error("A link was not provided in the correct format."));
        let fake = Math.floor(Math.random() * (999 - 100 + 1)) + 100;

        fetch(link, {
            "method": "GET",
            "headers": {
                "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${fake}.0) Gecko/20100101 Firefox/${fake}.0`
            }
        })
            .then((response) => {
                response.text()
                    .then((HTMLResponse) => {
                        try {                        
                            let txtPrice = HTMLResponse.replace(/ /g, "").replace(/\n/g, "").split(`property="product:price:amount"content="`)[1].split(`"/>`)[0];
                            let price = parseFloat(txtPrice);

                            if (isNaN(price)) return reject(new Error("Error when obtaining the requested price, the website may have changed format!"));

                            return resolve(price);
                        } catch (e) {
                            return reject(new Error("Error when obtaining the requested price, the website may have changed format!"));
                        };
                    })
                    .catch((e) => {
                        reject(e);
                    });
            })
            .catch((e) => {
                reject(e);
            });
    });
};