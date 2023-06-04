const { RestBase } = require("../lib/rest/restbase");
const { CursosMateriasService } = require("./cursosmateriasservice");

class CursosMateriasRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        this.path = "cursos_materias";
    }


    build() {
        this.buildVerb("list", CursosMateriasService);
    }

}

module.exports.CursosMateriasRest = CursosMateriasRest;