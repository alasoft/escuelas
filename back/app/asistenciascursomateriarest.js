const { RestBase } = require("../lib/rest/restbase");
const { AsistenciasCursoMateriaService } = require("./asistenciascursomateriaserivice");

class AsistenciasCursoMateriaRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        this.path = "asistencias_cursomateria";
    }

    build() {
        this.buildVerb("list", AsistenciasCursoMateriaService);
    }

}

module.exports.AsistenciasCursoMateriaRest = AsistenciasCursoMateriaRest