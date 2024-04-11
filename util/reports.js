/**
 * @description Archivo de utilidad encargado de gestionar los informes.
 */

const fs = require("fs");

/**
 * Creas un informe que se guardara en la carpeta ./reports con la fecha correspondiente.
 * Devuelve verdadero si se pudo crear el informe.
 * @param {Object} content El contenido del reporte.
 * @param {String} name El nombre del reporte.
 * @returns {Boolean}
 */
function create(content, name) {
    try {
        let now = new Date();
        let formatedDate = String(now.getDate()).padStart(2, '0') + "-" + String(now.getMonth() + 1).padStart(2, '0') + "-" + now.getFullYear();
        let fileName = `./reports/${name}-${formatedDate}.json`;
        let fileLastName = `./reports/${name}-last.json`;

        fs.writeFileSync(fileName, JSON.stringify(content));

        fs.writeFileSync(fileLastName, JSON.stringify(content));

        return true;
    } catch (e) {
        console.log(e)
        return false;
    };
};

/**
 * Obtienes el informe de la fecha solicitada. 
 * Si no se especifica una fecha se tomara el ultimo informe
 * @param {String} name El nombre del informe.
 * @param {String?} date La fecha del informe.
 * @returns {String | null}
 */
function get(name, date = "last") {
    try {
        if (!name) return reject(new Error("A name was not provided to search the report."));
        let fileName = `./reports/${name}-${date}.json`;

        return fs.readFileSync(fileName).toString();
    } catch (e) {
        console.log(e)
        return null;
    };
};


/**
 * Modulo encargado de gestionar los informes.
 */
module.exports = {
    get,
    create
};