const { Exceptions } = require("./exceptions");
const { ServiceBase } = require("./servicebase");
const { Sql } = require("./sql");
const { Users } = require("./users");
const { Utils } = require("./utils");

class UsersRegisterService extends ServiceBase {

    execute() {
        this.validate()
            .then(() =>
                this.prepareValues())
            .then(() =>
                this.db.execute(this.sqlInsert()))
            .then(() =>
                this.sendIdDto())
            .catch(err =>
                this.sendError(err))
    }

    validate() {
        return this.validateRequiredValues()
            .then(() =>
                this.checkEmail())
    }

    requiredValues() {
        return "nombre,apellido,email,password";
    }

    checkEmail() {
        return this.db.count(this.sqlCheckEmail()).then(count => {
            if (0 < count) {
                throw Exceptions.DuplicatedEmail()
            }
        })
    }

    sqlCheckEmail() {
        return Sql.Count({
            filterByTenant: false,
            from: "users",
            where: "upper(email)=upper(@email)",
            parameters: { email: this.value("email") }
        })
    }

    prepareValues() {
        this.setValue("tenant", Utils.NewGuid());
        this.setValue("id", Utils.NewGuid());
        this.setValue("rol", Users.ROL_USER)
    }

    sqlInsert() {
        return Sql.Insert({
            tableName: "users",
            values: this.values()
        })
    }

}

class UsersLoginService extends ServiceBase {

    execute() {
        this.validate()
            .then(() =>
                this.findUser())
            .then(user =>
                this.validateUser(user))
            .then(user =>
                this.newToken(user))
            .then(userWithToken =>
                this.sendOkey(userWithToken))
            .catch(err =>
                this.sendError(err)
            )
    }

    requiredValues() {
        return "email,password";
    }

    findUser() {
        return this.db.selectOne(this.sqlFindUser())
    }

    sqlFindUser() {
        return Sql.Select({
            filterByTenant: false,
            from: "users",
            where: "email=@email",
            parameters: { email: this.value("email") }
        })
    }

    validateUser(user) {
        if (Utils.IsNotDefined(user) || user.password != this.value("password")) {
            throw Exception.InvalidEmailPassword;
        }
        return user
    }

    newToken(user) {
        return this.app.newToken(user);
    }

}

module.exports.UsersRegisterService = UsersRegisterService;
module.exports.UsersLoginService = UsersLoginService;