/**
 * @description Archivo de utilidad encargado de proporcionar distintas funciones matematicas.
 */

/**
 * Obtines la mediana de una lista de numeros.
 * @param {Number[]} list
 * @returns {Number}
 */
function getMedian(list) {
    list.sort((a, b) => {
        return a - b
    });

    if (list.length == 0) throw new Error("There are no numbers available to analyze.");
    if (list.length == 1) return list[0];
    if (list.length == 2) return list[0];
    if (list.length == 3) return list[1];

    if (list.length % 2 == 0) {
        return list[(list.length - 2) / 2];
    } else {
        return list[(list.length - 1) / 2];
    };
};

/**
 * Obtines el promedio de una lista de numeros.
 * @param {Number[]} list
 * @returns {Number}
 */
function getAverage(list) {
    if (list.length == 0) throw new Error("There are no numbers available to analyze.");

    let sum = list.reduce((a, b) => a + b, 0);

    return sum / list.length;
};

/**
 * Modulo que proporciona distintas funciones matematicas.
 */
module.exports = {
    getAverage,
    getMedian
};