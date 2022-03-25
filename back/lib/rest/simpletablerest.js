const {
    SimpleTableListService,
    SimpleTableGetService,
    SimpleTableInsertService,
    SimpleTableUpdateService,
    SimpleTableDeleteService
} = require("./simpletableservice");
const { Utils } = require("./utils");
const { TableRest } = require("./tablerest");

class SimpleTableRest extends TableRest {

    build() {
        this.buildVerb("list", SimpleTableListService);
        this.buildVerb("get", SimpleTableGetService);
        this.buildVerb("insert", SimpleTableInsertService);
        this.buildVerb("update", SimpleTableUpdateService);
        this.buildVerb("delete", SimpleTableDeleteService);
    }

}

module.exports.SimpleTableRest = SimpleTableRest;