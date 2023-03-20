const { TableRest } = require("../lib/rest/tablerest");
const { NotasListService, NotasUpdateService } = require("./notasservice");

class NotasRest extends TableRest {

    getTableName() {
        return "notas";
    }

    build() {
        this.buildVerb("list", NotasListService);
        this.buildVerb("update", NotasUpdateService);
    }

}

module.exports.NotasRest = NotasRest;