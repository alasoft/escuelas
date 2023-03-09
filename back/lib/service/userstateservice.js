const { Exceptions } = require("../utils/exceptions");
const { ServiceBase } = require("./servicebase");
const { Sql } = require("../sql/sql");
const { Utils, Strings } = require("../utils/utils")

class UserStateSave extends ServiceBase {

    execute() {
        this.validate()
            .then(() =>
                this.saveState())
            .then(() =>
                this.sendOkey(true))
            .catch(err =>
                this.sendError(err))
    }

    validate() {
        return this.validateRequiredValues()
            .then(() =>
                this.checkUserId())
            .then(exists => {
                if (exists) {
                    return true;
                } else {
                    throw Exceptions.UserNotExists()
                }

            })
    }

    requiredValues() {
        return "user,module,state"
    }

    checkUserId() {
        return this.dbExists(this.sqlCheckUserId());
    }

    sqlCheckUserId() {
        return this.sqlSelect({
            columns: [
                "id"
            ],
            from: "users",
            where: this.sqlAnd()
                .add(this.sqlText("id=@id", { id: this.value("user") }))
        })
    }

    saveState() {
        return this.dbExecute(this.sqlSaveStatus())
    }

    sqlSaveStatus() {
        return Sql.Transact([
            this.sqlDeleteStatus(),
            this.sqlInsertStatus()
        ])
    }

    sqlDeleteStatus() {
        return this.sqlDeleteWhere({
            tableName: "users_states",
            where: this.sqlAnd()
                .add(this.sqlText(Strings.DoubleQuotes("user") + "=@user", { user: this.value("user") }))
                .add(this.sqlText("upper(module)=upper(@module)", { module: this.value("module") })),
        })
    }

    sqlInsertStatus() {
        return this.sqlInsert({
            tableName: "users_states",
            values: this.jsonValues("user,module,state")
        })
    }

}

class UserStateGet extends ServiceBase {

    execute() {
        this.validate()
            .then(() =>
                this.getState())
            .then(row =>
                this.sendOkey(row != undefined ? row.state : undefined))
            .catch(err =>
                this.sendError(err))

    }

    requiredValues() {
        return "user,module"
    }

    getState() {
        return this.dbSelectOne(this.sqlGetState())
    }

    sqlGetState() {
        return this.sqlSelect({
            columns: [
                "state"
            ],
            from: "users_states",
            where: this.sqlAnd()
                .add(this.sqlText(Strings.DoubleQuotes("user") + "=@user", { user: this.value("user") }))
                .add(this.sqlText("upper(module)=upper(@module)", { module: this.value("module") })),
        })
    }


}

module.exports.UserStateSave = UserStateSave
module.exports.UserStateGet = UserStateGet