const {
    ExamenesListService,
    ExamenesGetService,
    ExamenesInsertService,
    ExamenesUpdateService,
    ExamenesDeleteService
} = require("./examenesservice");
const { TableRest } = require("../lib/rest/tablerest");

class ExamenesRest extends TableRest {

    getTableName() {
        return "examenes";
    }

    build() {
        this.buildVerb("list", ExamenesListService);
        this.buildVerb("get", ExamenesGetService);
        this.buildVerb("insert", ExamenesInsertService);
        this.buildVerb("update", ExamenesUpdateService);
        this.buildVerb("delete", ExamenesDeleteService);
    }

}

module.exports.ExamenesRest = ExamenesRest;