const { Exceptions } = require("../utils/exceptions.js");
const { ServiceBase } = require("../service/servicebase");

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
        this.validate()
            .then(() =>
                this.dbSelectOne(this.sql()))
            .then(row =>
                this.sendRow(row))
            .catch(err =>
                this.sendError(err))
    }

    requiredValues() {
        return "id"
    }

    sqlParameters() {
        return {
            from: this.tableName,
            where: "id=@id",
            parameters: { id: this.received("id") }
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
                this.dbExecute(this.sql()))
            .then(() =>
                this.sendIdDto())
            .catch(err =>
                this.sendError(err))
    }

    sqlParameters() {
        return {
            tableName: this.tableName,
            values: this.sqlValues()
        }
    }

    sqlValues() {
        return this.values()
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
                throw Exceptions.DuplicatedEntity()
            }
        })
    }

    sqlNotDuplicated() {
        throw Exceptions.NotImplemented({ detail: "sqlNotDuplicated" })
    }

}

class TableInsertService extends TableInsertUpdateServiceBase {

    sql() {
        return this.sqlInsert(this.sqlParameters())
    }

}

class TableUpdateService extends TableInsertUpdateServiceBase {

    requiredValues() {
        return "id"
    }

    sql() {
        return this.sqlUpdate(this.sqlParameters())
    }

}

class TableDeleteService extends TableCrudServiceBase {

    requiredValues() {
        return "id"
    }

    sql() {
        return this.sqlDelete(this.sqlParameters())
    }

    sqlValues() {
        return { id: this.id() }
    }

}

module.exports.TableListService = TableListService;
module.exports.TableGetService = TableGetService;
module.exports.TableInsertService = TableInsertService;
module.exports.TableUpdateService = TableUpdateService;
module.exports.TableDeleteService = TableDeleteService;