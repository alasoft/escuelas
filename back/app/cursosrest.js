const { TableRest } = require("../lib/rest/tablerest");
const {
    CursosListService,
    CursosGetService,
    CursosInsertService,
    CursosUpdateService,
    CursosDeleteService
} = require("./cursosservice");

class CursosRest extends TableRest {

    getTableName() {
        return "cursos";
    }

    build() {
        this.buildVerb("list", CursosListService);
        this.buildVerb("get", CursosGetService);
        this.buildVerb("insert", CursosInsertService);
        this.buildVerb("update", CursosUpdateService);
        this.buildVerb("delete", CursosDeleteService);
    }

}

module.exports.CursosRest = CursosRest;