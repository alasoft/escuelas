const { TpsListService, TpsGetService, TpsInsertService, TpsUpdateService } = require("../service/tpsservice");
const { TableRest } = require("./tablerest");

class TpsRest extends TableRest {

    getTableName() {
        return "tps";
    }

    build() {
        this.buildVerb("list", TpsListService);
        this.buildVerb("get", TpsGetService);
        this.buildVerb("insert", TpsInsertService);
        this.buildVerb("update", TpsUpdateService);
    }

}

module.exports.TpsRest = TpsRest;