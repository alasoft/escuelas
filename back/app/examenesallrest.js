const { TableRest } = require("../lib/rest/tablerest");
const { ExamenesListAllService } = require("./examenesallservice");
const { ExamenesGetService, ExamenesDeleteService } = require("./examenesservice");

class ExamenesAllRest extends TableRest {

    getTableName() {
        return "examenes";
    }
    build() {
        this.buildVerb("list", ExamenesListAllService);
        this.buildVerb("get", ExamenesGetService);
        this.buildVerb("delete", ExamenesDeleteService)
    }

}

module.exports.ExamenesAllRest = ExamenesAllRest;