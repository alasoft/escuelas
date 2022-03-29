const { TableRest } = require("../lib/rest/tablerest");
const {
    PeriodosListService,
    PeriodosGetService,
    PeriodosInsertService,
    PeriodosUpdateService,
    PeriodosDeleteService
} = require("./periodosservice");

class PeriodosRest extends TableRest {

    getTableName() {
        return "periodos";
    }

    build() {
        this.buildVerb("list", PeriodosListService);
        this.buildVerb("get", PeriodosGetService);
        this.buildVerb("insert", PeriodosInsertService);
        this.buildVerb("update", PeriodosUpdateService);
        this.buildVerb("delete", PeriodosDeleteService);
    }

}

module.exports.PeriodosRest = PeriodosRest;