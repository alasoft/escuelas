const { TableRest } = require("../lib/rest/tablerest");
const {
    MateriasCursosListService,
    MateriasCursosGetService,
    MateriasCursosInsertService,
    MateriasCursosUpdateService,
    MateriasCursosDeleteService
} = require("./materiascursosservice");

class MateriasCursosRest extends TableRest {

    getTableName() {
        return "materias_cursos";
    }

    build() {
        this.buildVerb("list", MateriasCursosListService);
        this.buildVerb("get", MateriasCursosGetService);
        this.buildVerb("insert", MateriasCursosInsertService);
        this.buildVerb("update", MateriasCursosUpdateService);
        this.buildVerb("delete", MateriasCursosDeleteService);
    }

}

module.exports.MateriasCursosRest = MateriasCursosRest;