/**
 * @description Archivo de utilidad encargado de gestionar los informes.
 */

const fs = require("fs");
const reports = new Map();

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
        let fileName = `.${name}-${formatedDate}`;
        let fileLastName = `${name}-last`;

        reports.set(fileName, content);
        reports.set(fileLastName, content);

        fs.writeFileSync(`./reports/${fileName}.json`, JSON.stringify(content));
        fs.writeFileSync(`./reports/${fileLastName}.json`, JSON.stringify(content));

        return true;
    } catch (e) {
        return false;
    };
};

/**
 * Obtienes el informe de la fecha solicitada. 
 * Si no se especifica una fecha se tomara el ultimo informe
 * @param {String} name El nombre del informe.
 * @param {String?} date La fecha del informe.
 * @returns {Object | null}
 */
function get(name, date = "last") {
    if (!name) throw new Error("A name was not provided to search the report.");
    let fileName = `${name}-${date}`;

    try {
        if (reports.has(fileName)) {
            return reports.get(fileName);
        } else {
            let report = JSON.parse(fs.readFileSync(`./reports/${fileName}.json`).toString());
            reports.set(fileName, report);

            return report;
        };
    } catch (e) {
        if (date != "last") reports.set(fileName, null);
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