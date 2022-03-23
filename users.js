const { Sql } = require("./sql");
const { SqlType } = require("./sqltype");

class Users {

    static ROL_USER = "U";
    static ROL_TEST = "T";

    static UserTest = {
        apellido: "",
        nombre: "TEST",
        email: "test@test.com",
        password: "test",
        tenant: "test",
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
                    this.insertUserTest()
                }
            })
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

    insertUserTest() {
        return this.db.execute(this.sqlInsertUserTest());
    }

    sqlExistUserTest() {
        return Sql.Select({
            tenant: Users.UserTest.tenant,
            columns: "id",
            from: "users",
            where: "email=@email",
            values: { email: Users.UserTest.email }
        })
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