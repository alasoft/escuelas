const { builtinModules } = require("module");
const { Sql } = require("../sql/sql");

class CreateTablesBase {

    constructor(parameters) {
        this.parameters = parameters;
        this.app = this.parameters.app;
        this.db = this.app.db;
    }

    execute() {
        const sql = Sql.Transact(this.sql());
        this.app.log(sql);
        return this.db.execute(sql);
    }

    sql() {
        return []
    }

}

module.exports.CreateTablesBase = CreateTablesBase;