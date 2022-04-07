const { TableRest } = require("../lib/rest/tablerest");
const {
    EvaluacionesListService,
    EvaluacionesUpdateService
} = require("./evaluacionesservice");

class EvaluacionesRest extends TableRest {

    getTableName() {
        return "evaluaciones";
    }

    build() {
        this.buildVerb("list", EvaluacionesListService);
        this.buildVerb("update", EvaluacionesUpdateService);
    }

}

module.exports.EvaluacionesRest = EvaluacionesRest;