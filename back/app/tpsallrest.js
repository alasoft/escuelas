const { TableRest } = require("../lib/rest/tablerest");
const { TpsListAllService } = require("./tpsallservice");
const { TpsGetService, TpsDeleteService } = require("./tpsservice");

class TpsAllRest extends TableRest {

    getTableName() {
        return "tps";
    }
    build() {
        this.buildVerb("list", TpsListAllService);
        this.buildVerb("get", TpsGetService);
        this.buildVerb("delete", TpsDeleteService)
    }

}

module.exports.TpsAllRest = TpsAllRest;