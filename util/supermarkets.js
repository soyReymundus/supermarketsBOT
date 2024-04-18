/**
 * @description Archivo de utilidad encargado de proporcionar las clases necesarias para poder gestionar los supermercados y sus productos.
 */

const anonimaManager = require("./sourceManagers/laAnonima.js");
const standardSupermarketManager = require("./sourceManagers/standardSupermarket.js");
const operations = require("./operations.js");

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

    /**
     * Obtienes un array con los precios en bruto de todos los productos de todos supermercados.
     * @private
     * @returns {Number[]}
     */
    getRawPrices() {
        return getSubRawPrices(this.supermarkets);
    };

    /**
     * Obtienes la suma del precio de todos los productos de todos supermercados.
     * @returns {Number}
     */
    totalPrices() {
        return this.getRawPrices().reduce((a, b) => a + b, 0);
    };

    /**
     * Obtienes el promedio de todos los productos de todos los supermercados.
     * @returns {Number}
     */
    getAverage() {
        return operations.getAverage(this.getRawPrices());
    };

    /**
     * Obtienes la mediana de todos los productos de todos los supermercados.
     * @returns {Number}
     */
    getMedian() {
        return operations.getMedian(this.getRawPrices());
    };

    /**
     * Obtienes la suma del promedio de los precios de todos los supermercados.
     * @returns {Number}
     */
    totalAverages() {
        return totalSubClassAverages(this.supermarkets);
    };

    /**
     * Obtienes la suma de la mediana de los precios de todos los supermercados.
     * @returns {Number}
     */
    totalMedian() {
        return totalSubClassMedian(this.supermarkets);
    };

    /**
     * Obtienes los promedio de la suma de los promedios de los productos de todos los supermercados.
     * @returns {Number[]}
     */
    getAllProductsAverage() {
        let prices = [];

        for (let index = 0; index < this.supermarkets.length; index++) {
            const supermarket = this.supermarkets[index];

            prices.push(supermarket.totalAverages());
        };

        return prices;
    };

    /**
     * Obtienes los medianas de la suma de las medianas de los productos de todos los supermercados.
     * @returns {Number[]}
     */
    getAllProductsMedian() {
        let prices = [];

        for (let index = 0; index < this.supermarkets.length; index++) {
            const supermarket = this.supermarkets[index];

            prices.push(supermarket.totalMedian());
        };

        return prices;
    };

    /**
     * Obtienes el promedio de la suma de los promedios de los productos de todos los supermercados.
     * @returns {Number}
     */
    getProductsAverage() {
        return operations.getAverage(this.getAllProductsAverage());
    };

    /**
     * Obtienes la mediana de la suma de las medianas de los productos de todos los supermercados.
     * @returns {Number}
     */
    getProductsMedian() {
        return operations.getMedian(this.getAllProductsMedian());
    };

    /**
     * Esta funcion convierte la clase en un JSON.
     * Ideal para almacenar en archivos o MongoDB.
     * @returns {{name: String, source: String, products: {unitOfMeasurement: String, quantity: Number, name: String, abbreviation: String, links: {price: Number, link: String}[]}[]}[]}
     */
    toJSON() {
        return getSubJSONs(this.supermarkets);
    };

    /**
     * Obtienes la fuente de informacion de todos los supermercados.
     * @returns {String[]}
     */
    getSources() {
        let source = [];

        for (let index = 0; index < this.supermarkets.length; index++) {
            const supermarket = this.supermarkets[index];

            source.push(supermarket.source);
        };

        return source;
    };

    /**
     * Obtienes los nombres de todos los supermercados.
     * @returns {String[]}
     */
    getNames() {
        let names = [];

        for (let index = 0; index < this.supermarkets.length; index++) {
            const supermarket = this.supermarkets[index];

            names.push(supermarket.name);
        };

        return names;
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

    /**
     * Obtienes un array con los precios en bruto de todos los productos del supermercado.
     * @private
     * @returns {Number[]}
     */
    getRawPrices() {
        return getSubRawPrices(this.products);
    };

    /**
     * Obtienes la suma del precio de todos los productos del supermercado.
     * @returns {Number}
     */
    totalPrices() {
        return this.getRawPrices().reduce((a, b) => a + b, 0);
    };

    /**
     * Obtienes el promedio de todos los productos del supermercado.
     * @returns {Number}
     */
    getAverage() {
        return operations.getAverage(this.getRawPrices());
    };

    /**
     * Obtienes la mediana de todos los productos del supermercado.
     * @returns {Number}
     */
    getMedian() {
        return operations.getMedian(this.getRawPrices());
    };

    /**
     * Obtienes la suma del promedio de los precios de todos los productos del supermercado.
     * @returns {Number}
     */
    totalAverages() {
        return totalSubClassAverages(this.products);
    };

    /**
     * Obtienes la suma de la mediana de los precios de todos los productos del supermercado.
     * @returns {Number}
     */
    totalMedian() {
        return totalSubClassMedian(this.products);
    };

    /**
     * Esta funcion convierte la clase en un JSON.
     * Ideal para almacenar en archivos o MongoDB.
     * @returns {{name: String, source: String, products: {unitOfMeasurement: String, quantity: Number, name: String, abbreviation: String, links: {price: Number, link: String}[]}[]}}
     */
    toJSON() {
        return {
            "name": this.name,
            "source": this.source,
            "products": getSubJSONs(this.products)
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
     * @param {{"name": String, "quantity": Number, "unitOfMeasurement": String, "abbreviation": String, "links": String[] }} data Datos del producto a gestionar.
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
     * Obtienes un array con los precios en bruto de todas las fuentas del producto.
     * @private
     * @returns {Number[]}
     */
    getRawPrices() {
        let prices = [];

        for (let index = 0; index < this.links.length; index++) {
            const link = this.links[index];

            if (!link.price) continue;
            if (typeof link.price != "number") continue;

            prices.push(link.price);
        };

        return prices;
    };

    /**
     * Obtienes la suma del precio de todos las fuentes.
     * Para obtener el precio de cada fuente individual revisa el array Product.links
     * @returns {Number}
     */
    totalPrices() {
        return this.getRawPrices().reduce((a, b) => a + b, 0);
    };

    /**
     * Obtienes el promedio de todos las fuentes.
     * Para obtener el precio de cada fuente individual revisa el array Product.links
     * @returns {Number}
     */
    getAverage() {
        return operations.getAverage(this.getRawPrices());
    };

    /**
     * Obtienes la mediana de todos las fuentes.
     * Para obtener el precio de cada fuente individual revisa el array Product.links
     * @returns {Number}
     */
    getMedian() {
        return operations.getMedian(this.getRawPrices());
    };

    /**
     * Esta funcion convierte la clase en un JSON.
     * Ideal para almacenar en archivos o MongoDB.
     * @returns {{unitOfMeasurement: String, quantity: Number, name: String, abbreviation: String, links: {price: Number, link: String}[]}}
     */
    toJSON() {
        return {
            "unitOfMeasurement": this.unitOfMeasurement,
            "quantity": this.quantity,
            "name": this.name,
            "abbreviation": this.abbreviation,
            "links": getSubJSONs(this.links)
        };
    };
};

/**
 * Esta clase se encarga de gestionar el link de un producto.
 */
class ProductLink {

    /**
     * Esta clase se encarga de gestionar el link de un producto.
     * @param {String | {link: String, price: Number}} data El link a ser gestionado.
     * @param {Product} product El producto de donde proviene el link.
     * @param {Boolean} getPrice Si es verdadero se solicitara el precio del producto en el constructor. Si es un numero se asignara ese precio por defecto.
     */
    constructor(data, product, getPrice) {
        if (!product || !(product instanceof Product)) throw new Error("No product was provided for the link.");

        /**
         * El producto de donde proviene el link.
         * @type {Product}
         */
        this.product = product;

        /**
         * El link que se esta gestionado.
         * @type {String | {link: String, price: Number}}
         */
        this.link

        /**
         * El precio del producto especifico.
         * @type {Number}
         */
        this.price;

        if (!data || typeof data != "string") {
            this.link = data["link"];
            this.price = data["price"];
        } else {
            this.link = data;
        };


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
                case "https://supermercado.laanonimaonline.com":
                    anonimaManager.getPrice(this.link)
                        .then((price) => {
                            resolve(price);
                            this.price = price;
                        })
                        .catch((e) => {
                            reject(e);
                        });
                    break;
                case "https://www.carrefour.com.ar":
                    standardSupermarketManager.getPrice(this.link)
                        .then((price) => {
                            resolve(price);
                            this.price = price;
                        })
                        .catch((e) => {
                            reject(e);
                        });
                    break;
                case "https://www.vea.com.ar":
                    standardSupermarketManager.getPrice(this.link)
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

    /**
     * Esta funcion convierte la clase en un JSON.
     * Ideal para almacenar en archivos o MongoDB.
     * @returns {{price: Number, link: String}}
     */
    toJSON() {
        return {
            "price": this.price,
            "link": this.link
        };
    };
};

/**
 * Funcion que ayuda a acortar codigo obteniendo los precios en brutos de cualquier clase que dependa de una subclase.
 * @param {any[]} subClass Las clases a escanear en busca de precios en bruto.
 * @returns {Number[]}
 */
function getSubRawPrices(subClass) {
    let prices = [];

    for (let index = 0; index < subClass.length; index++) {
        const originalClass = subClass[index];

        prices = prices.concat(originalClass.getRawPrices());
    };

    return prices;
};

/**
 * Funcion que ayuda a convertir un array de clases en un JSON.
 * @param {any[]} subClass Las clases a escanear para convertir en JSONs.
 * @returns {any[]}
 */
function getSubJSONs(subClass) {
    let array = [];

    for (let index = 0; index < subClass.length; index++) {
        const originalClass = subClass[index];

        array.push(originalClass.toJSON());
    };

    return array;
};

/**
 * Obtienes la suma del promedio de toda la subclase.
 * @param {any[]} subClass Las clases a escanear.
 * @return {Number}
 */
function totalSubClassAverages(subClass) {
    let total = 0;

    for (let index = 0; index < subClass.length; index++) {
        const originalClass = subClass[index];

        total += originalClass.getAverage();
    };

    return total;
};

/**
 * Obtienes la suma de la mediana de toda la subclase.
 * @param {any[]} subClass Las clases a escanear.
 * @return {Number}
 */
function totalSubClassMedian(subClass) {
    let total = 0;

    for (let index = 0; index < subClass.length; index++) {
        const originalClass = subClass[index];

        total += originalClass.getMedian();
    };

    return total;
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