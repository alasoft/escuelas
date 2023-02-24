const {
    MdhListService,
    MdhGetService,
    MdhInsertService,
    MdhUpdateService,
    MdhDeleteService
} = require("./mdhservice");
const { TableRest } = require("../lib/rest/tablerest");

class MdhRest extends TableRest {

    getTableName() {
        return "mdh";
    }

    build() {
        this.buildVerb("list", MdhListService);
        this.buildVerb("get", MdhGetService);
        this.buildVerb("insert", MdhInsertService);
        this.buildVerb("update", MdhUpdateService);
        this.buildVerb("delete", MdhDeleteService);
    }

}

module.exports.MdhRest = MdhRest;