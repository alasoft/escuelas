const { DbStates } = require("../data/dbstates");
const { Sql } = require("../sql/sql");
const { SqlType } = require("../sql/sqltype");
const { Utils } = require("../utils/utils");

class Users {

    static ROL_USER = "U";
    static ROL_TEST = "T";

    static UserTest = {
        tenant: "test",
        id: Utils.NewGuid(),
        apellido: "",
        nombre: "TEST",
        email: "test@test.com",
        password: Utils.Encrypt("test"),
        rol: this.ROL_TEST
    };

}

class UsersCreateTable {

    constructor(parameters = {}) {
        this.parameters = parameters;
        this.app = parameters.app;
        this.db = this.app.db;
    }

    execute() {
        return this.createTable()
            .then(() =>
                this.userTestExists())
            .then(exists => {
                if (!exists) {
                    return this.insertUserTest()
                }
            })
            .catch(err =>
                this.app.sendError(err))
    }

    createTable() {
        return this.db.execute(this.sqlCreateTable());
    }

    sqlCreateTable() {
        return Sql.Create({
            tableName: "users",
            columns: {
                apellido: SqlType.UserApellido(),
                nombre: SqlType.UserNombre(),
                email: SqlType.UserEmail(),
                password: SqlType.UserPassword(),
                rol: SqlType.UserRol()
            }
        });
    }

    userTestExists() {
        return this.db.exists(this.sqlExistUserTest());
    }

    sqlExistUserTest() {
        return Sql.Select({
            tenant: Users.UserTest.tenant,
            filterByStates: DbStates.All,
            columns: "id",
            from: "users",
            where: "upper(email)=upper(@email)",
            parameters: { email: Users.UserTest.email }
        })
    }

    insertUserTest() {
        return this.db.execute(this.sqlInsertUserTest());
    }

    sqlInsertUserTest() {
        return Sql.Insert({
            tableName: "users",
            values: Users.UserTest
        })
    }

}

module.exports.Users = Users;
module.exports.UsersCreateTable = UsersCreateTable;