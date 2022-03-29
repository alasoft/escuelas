const { Exceptions } = require("../utils/exceptions");
const { ServiceBase } = require("../service/servicebase");
const { Sql } = require("../sql/sql");
const { Users } = require("../users/users");
const { Utils } = require("../utils/utils");

class UsersService extends ServiceBase {

    sqlFindUserParameters() {
        return {
            filterByTenant: false,
            from: "users",
            where: "upper(email)=upper(@email)",
            parameters: { email: this.value("email") }
        }
    }

}

class UsersRegisterService extends UsersService {

    execute() {
        this.validate()
            .then(() =>
                this.prepareValues())
            .then(() =>
                this.dbExecute(this.sqlInsert()))
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
        return this.dbCount(this.sqlCheckEmail()).then(count => {
            if (0 < count) {
                throw Exceptions.DuplicatedEmail()
            }
        })
    }

    sqlCheckEmail() {
        return Sql.Count(this.sqlFindUserParameters())
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

class UsersLoginService extends UsersService {

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
        return this.dbSelectOne(this.sqlFindUser())
    }

    sqlFindUser() {
        return Sql.Select(this.sqlFindUserParameters())
    }

    validateUser(user) {
        if (Utils.IsNotDefined(user) || user.password != this.value("password")) {
            throw Exceptions.InvalidEmailPassword();
        }
        return user
    }

    newToken(user) {
        return this.app.newToken(user);
    }

}

module.exports.UsersRegisterService = UsersRegisterService;
module.exports.UsersLoginService = UsersLoginService;