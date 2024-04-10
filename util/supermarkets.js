/**
 * @description Archivo de utilidad encargado de proporcionar las clases necesarias para poder gestionar los supermercados y sus productos.
 */

const anonimaManager = require("./sourceManagers/laAnonima.js");

/**
 * Esta clase se encarga de gestionar los supermercados en general.
 */
class SuperMarkets {

    /**
     * Esta clase se encarga de gestionar los supermercados en general.
     * @param {{"name": String, "source": String, "products": {"name": String, "quantity": Number, "unitOfMeasurement": String, "abbreviation": String, "links": String[]}[]}[]} data Datos de todos los supermercados para realizar analisis.
     */
    constructor(data) {
        /**
         * Datos de todos los supermercados para realizar analisis.
         * @type {SuperMarket[]}
         */
        this.supermarkets = [];

        if (!Array.isArray(data)) throw new Error("An array of supermarkets was not provided in the required format.");

        if (data.length == 0) return;

        for (let index = 0; index < data.length; index++) {
            const JSONProduct = data[index];

            this.supermarkets.push(new SuperMarket(JSONProduct, this));
        };
    };
};

/**
 * Esta clase se encarga de gestionar un supermercado.
 */
class SuperMarket {

    /**
     * Esta clase se encarga de gestionar un supermercado.
     * @param {{"name": String, "source": String, "products": {"name": String, "quantity": Number, "unitOfMeasurement": String, "abbreviation": String, "links": String[]}[]}} data Datos del supermercado a gestionar.
     * @param {SuperMarkets?} base El gestionador de supermercados que se esta usando (opcional).
     */
    constructor(data, base) {
        if (!data["name"] || typeof data["name"] != "string") throw new Error("No name was provided for the supermarket.");

        /**
         * El nombre del supermercado.
         * @type {String}
         */
        this.name = data["name"];

        if (!data["source"] || typeof data["source"] != "string") throw new Error("No source was provided for the supermarket.");

        /**
         * La fuente de donde se saco la informacion del supermercado
         * @type {String}
         */
        this.source = data["source"];

        /**
         * El gestionador de supermercados que se esta usando.
         * @type {SuperMarkets | undefined}
         */
        this.base = base;

        /**
         * Los productos que posee el supermercado.
         * @type {Product[]}
         */
        this.products = [];

        if (!Array.isArray(data["products"])) throw new Error("An array of products was not provided in the required format.");

        if (data["products"].length == 0) return;

        for (let index = 0; index < data["products"].length; index++) {
            const JSONProduct = data["products"][index];

            this.products.push(new Product(JSONProduct, this));
        };
    };
};

/**
 * Esta clase se encarga de gestionar un producto.
 * Aviso: Un mismo producto puede ser de distintas marcas!
 */
class Product {

    /**
     * Esta clase se encarga de gestionar un producto.
     * @param {{"name": String, "quantity": Number, "unitOfMeasurement": String, "abbreviation": String, "links": String[]}} data Datos del producto a gestionar.
     * @param {SuperMarket} supermarket El supermercado donde se encuentra el producto.
     */
    constructor(data, supermarket) {
        if (!supermarket || !(supermarket instanceof SuperMarket)) throw new Error("No supermarket was provided for the product.");

        /**
         * El supermercado donde se encuentra el producto.
         * @type {SuperMarket}
         */
        this.supermarket = supermarket;

        if (!data["name"] || typeof data["name"] != "string") throw new Error("No name was provided for the product.");

        /**
         * El nombre del producto.
         * @type {String}
         */
        this.name = data["name"];

        if (!data["quantity"] || typeof data["quantity"] != "number") throw new Error("No quantity was provided for the product.");

        /**
         * La cantidad de producto en relacion a su unidad de medida.
         * @type {Number}
         */
        this.quantity = data["quantity"];

        if (!data["unitOfMeasurement"] || typeof data["unitOfMeasurement"] != "string") throw new Error("No unit of measurement was provided for the product.");

        /**
         * La unidad de medida del producto en relacion a su cantidad.
         * @type {String}
         */
        this.unitOfMeasurement = data["unitOfMeasurement"];

        if (!data["abbreviation"] || typeof data["abbreviation"] != "string") throw new Error("No abbreviation was provided for the product.");

        /**
         * La unidad abreviacion entre unidad de medida y cantidad.
         * Por ejemplo "2 Kilogramos" tendria que ser "2 Kg".
         * @type {String}
         */
        this.abbreviation = data["abbreviation"];

        /**
         * Los enlaces que posee el producto.
         * @type {ProductLink[]}
         */
        this.links = [];

        if (!Array.isArray(data["links"])) throw new Error("An array of links was not provided in the required format.");

        if (data["links"].length == 0) return;

        for (let index = 0; index < data["links"].length; index++) {
            const JSONLink = data["links"][index];

            this.links.push(new ProductLink(JSONLink, this, true));
        };
    };

    /**
     * Obtienes el promedio de todos los productos.
     * Para obtener el precio de cada fuente individual revisa el array Product.links
     * @returns {Number}
     */
    getAverage() {
        let totalOfLinks = this.links.length;
        let totalOfPrices = 0;

        for (let index = 0; index < this.links.length; index++) {
            const link = this.links[index];

            if (!link.price) {
                totalOfLinks--;
                continue;
            };

            totalOfPrices += link.price;
        };

        if (totalOfLinks == 0) throw new Error("There are no prices available to analyze.");

        return totalOfPrices / totalOfLinks;
    };

    /**
     * Obtienes la mediana de todos los productos.
     * Para obtener el precio de cada fuente individual revisa el array Product.links
     * @returns {Number}
     */
    getMedian() {
        let prices = [];

        for (let index = 0; index < this.links.length; index++) {
            const link = this.links[index];

            if (!link.price) continue;

            prices.push(link.price);
        };

        if (prices.length == 0) throw new Error("There are no prices available to analyze.");
        if (prices.length == 1) return prices[0];

        prices.sort((a, b) => {
            return a - b
        });

        if(prices.length % 2 == 0) { 
            return prices[(prices.length - 2) / 2];
        } else {
            return prices[(prices.length - 1) / 2];
        };
    };
};

/**
 * Esta clase se encarga de gestionar el link de un producto.
 */
class ProductLink {

    /**
     * Esta clase se encarga de gestionar el link de un producto.
     * @param {String} data El link a ser gestionado.
     * @param {Product} product El producto de donde proviene el link.
     * @param {Boolean} getPrice Si es verdadero se solicitara el precio del producto en el constructor.
     */
    constructor(data, product, getPrice) {
        if (!product || !(product instanceof Product)) throw new Error("No product was provided for the link.");

        /**
         * El producto de donde proviene el link.
         * @type {Product}
         */
        this.product = product;

        if (!data || typeof data != "string") throw new Error("No link was provided for the product.");

        /**
         * El link que se esta gestionado.
         * @type {String}
         */
        this.link = data;

        /**
         * El precio del producto especifico.
         * @type {Number}
         */
        this.price;

        if (getPrice) this.getPrice()
            .catch((e) => {
                console.warn(e);
            });
    };


    /**
     * Actualizas el precio del producto de esta clase.
     * Tambien devuelve ese mismo precio.
     * @returns {Promise<Number>}
     */
    getPrice() {
        return new Promise((resolve, reject) => {
            let source = this.product.supermarket.source;

            switch (source) {
                case "https://www.laanonima.com.ar":
                    anonimaManager.getPrice(this.link)
                        .then((price) => {
                            resolve(price);
                            this.price = price;
                        })
                        .catch((e) => {
                            reject(e);
                        });
                    break;
                default:
                    reject(new Error("Product source is not supported"));
                    break;
            };
        });
    };
};

/**
 * Modulo que proporciona las clases necesarias para poder gestionar los supermercados y sus productos.
 */
module.exports = {
    SuperMarkets,
    SuperMarket,
    Product,
    ProductLink
};