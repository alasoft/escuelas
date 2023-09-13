const { TableRest } = require("../lib/rest/tablerest");
const { MateriasHorasListAllService } = require("./materiashorasallservice");
const { MateriasHorasGetService, MateriasHorasDeleteService } = require("./materiashorasservice")

class MateriasHorasAllRest extends TableRest {

    constructor(parameters) {
        super(parameters);
        this.path = "materias_horas_all";
    }

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