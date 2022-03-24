const { builtinModules } = require("module");
const { Sql } = require("./sql");

class CreateTablesBase {

    constructor(parameters) {
        this.parameters = parameters;
        this.app = this.parameters.app;
        this.db = this.app.db;
    }

    execute() {
        return this.db.execute(Sql.Transact(this.sql()));
    }

    sql() {
        return []
    }

}

module.exports.CreateTablesBase = CreateTablesBase;