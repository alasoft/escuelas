const { TableRest } = require("../lib/rest/tablerest");
const { TpsListAllService } = require("./tpsallservice");

class TpsAllRest extends TableRest {

    getTableName() {
        return "tps";
    }
    build() {
        this.buildVerb("list", TpsListAllService);
    }

}

module.exports.TpsAllRest = TpsAllRest;