const { TableRest } = require("../lib/rest/tablerest");
const { MateriasHorasListAllService } = require("./materiashorasallservice");
const { MateriasHorasGetService, MateriasHorasDeleteService } = require("./materiashorasservice")

class MateriasHorasAllRest extends TableRest {

    getTableName() {
        return "materias_horas";
    }

    build() {
        this.buildVerb("list", MateriasHorasListAllService);
        this.buildVerb("get", MateriasHorasGetService);
        this.buildVerb("delete", MateriasHorasDeleteService)
    }

}

module.exports.MateriasHorasAllRest = MateriasHorasAllRest;