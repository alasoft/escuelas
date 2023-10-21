const { RestBase } = require("../lib/rest/restbase");
const { AsistenciasService } = require("./asistenciasservice");

class AsistenciasRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        this.path = "asistencias";
    }

    build() {
        this.buildVerb("list", AsistenciasService);
    }

}

module.exports.AsistenciasRest = AsistenciasRest