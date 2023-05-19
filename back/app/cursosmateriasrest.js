const { RestBase } = require("../lib/rest/restbase");
const { CursosMateriasListService } = require("./cursosmateriasservice");

class CursosMateriasRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        this.path = "materias_cursos";
    }


    build() {
        this.buildVerb("list", CursosMateriasListService);
    }

}

module.exports.CursosMateriasRest = CursosMateriasRest;