const { TableRest } = require("../lib/rest/tablerest");
const { MateriasHorasListAllService } = require("./materiashorasallservice");
const { MateriasHorasGetService } = require("./materiashorasservice")

class MateriasHorasAllRest extends TableRest {

    getTableName() {
        return "materias_horas";
    }

    build() {
        this.buildVerb("list", MateriasHorasListAllService);
        this.buildVerb("get", MateriasHorasGetService);
    }

}

module.exports.MateriasHorasAllRest = MateriasHorasAllRest;