const {
    TpsListService,
    TpsGetService,
    TpsInsertService,
    TpsUpdateService,
    TpsDeleteService
} = require("./tpsservice");
const { TableRest } = require("../lib/rest/tablerest");

class TpsRest extends TableRest {

    getTableName() {
        return "tps";
    }

    build() {
        this.buildVerb("list", TpsListService);
        this.buildVerb("get", TpsGetService);
        this.buildVerb("insert", TpsInsertService);
        this.buildVerb("update", TpsUpdateService);
        this.buildVerb("delete", TpsDeleteService);
    }

}

module.exports.TpsRest = TpsRest;