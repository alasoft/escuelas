const { TableRest } = require("../lib/rest/tablerest");

const {
    MateriasHorasListService,
    MateriasHorasGetService,
    MateriasHorasInsertService,
    MateriasHorasUpdateService,
    MateriasHorasDeleteService
} = require("./materiashorasservice");

class MateriasHorasRest extends TableRest {

    getTableName() {
        return "materias_horas";
    }

    build() {
        this.buildVerb("list", MateriasHorasListService);
        this.buildVerb("get", MateriasHorasGetService);
        this.buildVerb("insert", MateriasHorasInsertService);
        this.buildVerb("update", MateriasHorasUpdateService);
        this.buildVerb("delete", MateriasHorasDeleteService);
    }

}

module.exports.MateriasHorasRest = MateriasHorasRest;