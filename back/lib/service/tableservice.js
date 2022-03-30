const { Exceptions } = require("../utils/exceptions.js");
const { ServiceBase } = require("../service/servicebase");
const { Sql } = require("../sql/sql");
const { Utils } = require("../utils/utils");

class TableServiceBase extends ServiceBase {

    constructor(parameters) {
        super(parameters);
        this.tableName = parameters.tableName;
    }

}

class TableListGetService extends TableServiceBase {

    sql() {
        return this.sqlSelect(this.sqlParameters())
    }

    transformRow(row) {
        return row
    }

}

class TableListService extends TableListGetService {

    execute() {
        this.dbSelect(this.sql())
            .then(rows =>
                this.sendRows(rows))
            .catch(err =>
                this.sendError(err))
    }

    sqlParameters() {
        return {
            tableName: this.tableName
        }
    }

    sendRows(rows) {
        this.sendOkey(this.transformRows(rows))
    }

    transformRows(rows) {
        for (const row of rows) {
            this.transformRow(row)
        }
        return rows;
    }

}

class TableGetService extends TableListGetService {

    execute() {
        this.dbSelectOne(this.sql())
            .then(row =>
                this.sendRow(row))
            .catch(err =>
                this.sendError(err))
    }

    sqlParameters() {
        return {
            from: this.tableName,
            where: "id=@id",
            parameters: { id: this.id() }
        }
    }

    sendRow(row) {
        this.sendOkey(this.transformRow(row))
    }

}

class TableCrudServiceBase extends TableServiceBase {

    execute() {
        return this.validate()
            .then(() =>
                this.prepare())
            .then(() =>
                this.dbExecute(this.sql()))
            .then(() =>
                this.sendIdDto())
            .catch(err =>
                this.sendError(err))
    }

    prepare() {
        this.setValue("tenant", this.tenant());
    }

    sql() {
        return Sql[this.sqlOperation()](this.sqlParameters())
    }

    sqlParameters() {
        return {
            tableName: this.tableName,
            values: this.values()
        }
    }

}

class TableInsertUpdateServiceBase extends TableCrudServiceBase {

    validate() {
        return this.validateRequiredValues()
            .then(() =>
                this.validateNotDuplicated())
    }

    validateNotDuplicated() {
        return this.dbSelect(this.sqlNotDuplicated()).then(rows => {
            if (1 < rows.length || (rows.length == 1 && rows[0].id != this.id())) {
                throw Exceptions.DuplicatedEntity(this.duplicatedMessage())
            }
        })
    }

    sqlNotDuplicated() {
        throw Exceptions.NotImplemented("sqlNotDuplicated")
    }

    duplicatedMessage() {
        return this.parameters.duplicatedMessage || this.tableName + " registro duplicado";
    }

}

class TableInsertService extends TableInsertUpdateServiceBase {

    prepare() {
        super.prepare();
        if (this.isNotDefined("id")) {
            this.setValue("id", Utils.NewGuid())
        }
    }

    sqlOperation() {
        return "Insert"
    }

}

class TableUpdateService extends TableInsertUpdateServiceBase {

    sqlOperation() {
        return "Update"
    }

    requiredValues() {
        return "id"
    }

}

class TableDeleteService extends TableCrudServiceBase {

    sqlOperation() {
        return "Update"
    }

    requiredValues() {
        return "id"
    }

}

module.exports.TableListService = TableListService;
module.exports.TableGetService = TableGetService;
module.exports.TableInsertService = TableInsertService;
module.exports.TableUpdateService = TableUpdateService;
module.exports.TableDeleteService = TableDeleteService;