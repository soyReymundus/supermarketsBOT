const reports = require("./util/reports.js");
const express = require('express');
const app = express();

app.disable('x-powered-by');

app.get("/", (req, res) => {
    if (!req.query.name && !req.query.date && !req.query.limit) {
        res.setHeader("X-Status-Cat", "https://http.cat/200");
        return res
            .status(200)
            .json({
                "message": "Ok."
            });
    };

    if (!req.query.name) {
        res.setHeader("X-Status-Cat", "https://http.cat/400");
        return res
            .status(400)
            .json({
                "message": "No se proporciono el nombre de los informes solicitados."
            });
    };

    if (req.query.name.includes(".") || req.query.name.includes("/") || req.query.name.includes("\\") || req.query.name.includes("?")) {
        res.setHeader("X-Status-Cat", "https://http.cat/404");
        return res
            .status(404)
            .json({
                "message": "El informe solicitado no existe.",
                "adminPanel": "https://lc.cx/7cVzUW"
            });
    };

    let reportDate;
    let limit;
    let report;

    if (!!req.query.limit) {
        limit = parseInt(req.query.limit);

        if (isNaN(limit)) {
            res.setHeader("X-Status-Cat", "https://http.cat/415");
            return res
                .status(415)
                .json({
                    "message": "El limite no esta en el formato requerido."
                });
        };

        if (limit > 730) {
            res.setHeader("X-Status-Cat", "https://http.cat/406");
            return res
                .status(406)
                .json({
                    "message": "Has superado el limite del limite."
                });
        };
    };

    if (!!req.query.date) {
        let dates = req.query.date.split("-");

        if (dates.length != 3) {
            res.setHeader("X-Status-Cat", "https://http.cat/415");
            return res
                .status(415)
                .json({
                    "message": "La fecha no esta en el formato requerido."
                });
        };

        for (let index = 0; index < dates.length; index++) {
            if (dates[index].includes(".") || dates[index].includes("/") || dates[index].includes("\\") || dates[index].includes("?")) {
                res.setHeader("X-Status-Cat", "https://http.cat/404");
                return res
                    .status(415)
                    .json({
                        "message": "La fecha no esta en el formato requerido.",
                        "adminPanel": "https://lc.cx/7cVzUW"
                    });
            };

            dates[index] = parseInt(dates[index]);

            if (isNaN(dates[index])) {
                res.setHeader("X-Status-Cat", "https://http.cat/415");
                return res
                    .status(415)
                    .json({
                        "message": "La fecha no esta en el formato requerido."
                    });
            };
        };
        
        const now = new Date().getFullYear();
        if (dates[2] < 2023 || dates[2] > now) {
            res.setHeader("X-Status-Cat", "https://http.cat/400");
            return res
                .status(400)
                .json({
                    "message": "Se proporciono una fecha muy lejana."
                });
        };

        reportDate = new Date(dates[2], dates[1] - 1, dates[0]);
    };

    if (!reportDate) {
        if (!!limit) {
            res.setHeader("X-Status-Cat", "https://http.cat/406");
            return res
                .status(406)
                .json({
                    "message": "No se puede especificar un limite de informes sin especificar una fecha."
                });
        };

        report = reports.get(req.query.name);

        if (!report) {
            res.setHeader("X-Status-Cat", "https://http.cat/404");
            return res
                .status(404)
                .json({
                    "message": "Informe no encontrado."
                });
        };

        res.setHeader("X-Status-Cat", "https://http.cat/200");
        return res
            .status(200)
            .json({
                "message": "Ok.",
                "data": report
            });
    } else {
        if (!limit) {
            let formatedDate = String(reportDate.getDate()).padStart(2, '0') + "-" + String(reportDate.getMonth() + 1).padStart(2, '0') + "-" + reportDate.getFullYear();
            report = reports.get(req.query.name, formatedDate);

            if (!report) {
                res.setHeader("X-Status-Cat", "https://http.cat/404");
                return res
                    .status(404)
                    .json({
                        "message": "Informe no encontrado."
                    });
            };

            res.setHeader("X-Status-Cat", "https://http.cat/200");
            return res
                .status(200)
                .json({
                    "message": "Ok.",
                    "data": report
                });
        };

        report = [];
        let status = 200;

        for (let index = 0; limit != index; index++) {
            let formatedDate = String(reportDate.getDate()).padStart(2, '0') + "-" + String(reportDate.getMonth() + 1).padStart(2, '0') + "-" + reportDate.getFullYear();
            report.push(reports.get(req.query.name, formatedDate));

            reportDate = new Date(reportDate.getTime() - (24 * 60 * 60 * 1000));
        };

        if (report.includes(null)) status = 206;

        res.setHeader("X-Status-Cat", "https://http.cat/" + status);
        return res
            .status(status)
            .json({
                "message": "Ok.",
                "data": report
            });
    };
});

app.all("*", (req, res) => {
    if (req.method != "GET") {
        res.setHeader("X-Status-Cat", "https://http.cat/405");
        res
            .status(405)
            .json({
                "message": "Metodo no permitido."
            });
    } else {
        res.setHeader("X-Status-Cat", "https://http.cat/404");
        res
            .status(404)
            .json({
                "message": "La pagina solicitada no existe."
            });
    };
});

app.use((err, req, res, next) => {
    res.setHeader("X-Status-Cat", "https://http.cat/500");
    res
        .status(500)
        .json({
            "message": "Error interno, intente de nuevo mas tarde."
        });
});

module.exports = app;