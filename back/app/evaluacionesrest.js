const { TableRest } = require("../lib/rest/tablerest");
const { EvaluacionesListService } = require("./evaluacionesservice");

class EvaluacionesRest extends TableRest {

    getTableName() {
        return "evaluaciones";
    }

    build() {
        this.buildVerb("list", EvaluacionesListService);
    }

}

module.exports.EvaluacionesRest = EvaluacionesRest;