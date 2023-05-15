const { Exceptions } = require("../utils/exceptions");
const { ServiceBase } = require("./servicebase");
const { Sql, Sqls } = require("../sql/sql");
const { Users } = require("../users/users");
const { Utils, Strings } = require("../utils/utils");
const { DemoGenerate } = require("../utils/demogenerate");

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
            .then(() => {
                if (this.isDemo()) {
                    return this.generateDemoData()
                }
            })
            .then(() =>
                this.dbExecute(this.sql()))
            .then(() =>
                this.sendIdDto())
            .catch(err =>
                this.sendError(err))
    }

    validate() {
        return this.validateRequiredValues()
            .then(() =>
                this.checkApellidoNombre())
            .then(() =>
                this.checkEmail())
    }

    requiredValues() {
        return "nombre,apellido,email,password";
    }

    prepareValues() {
        this.setValue("tenant", Strings.NewGuid());
        this.setValue("id", Strings.NewGuid());
        this.setValue("rol", Users.ROL_USER)
        this.setValue("password", Utils.Encrypt(this.value("password")))
    }

    checkApellidoNombre() {
        return this.dbCount(this.sqlCheckApellidoNombre()).then(count => {
            if (0 < count) {
                throw Exceptions.DuplicatedApellidoNombre()
            }
        })
    }

    checkEmail() {
        return this.dbCount(this.sqlCheckEmail()).then(count => {
            if (0 < count) {
                throw Exceptions.DuplicatedEmail()
            }
        })
    }

    sqlCheckApellidoNombre() {
        return Sql.Count(this.sqlFindApellidoNombreParameters());
    }

    sqlFindApellidoNombreParameters() {
        return {
            filterByTenant: false,
            from: "users",
            where: this.sqlAnd()
                .addSql("upper(apellido)=upper(@apellido)", { apellido: this.value("apellido") })
                .addSql("upper(nombre)=upper(@nombre)", { nombre: this.value("nombre") })
        }
    }

    sqlCheckEmail() {
        return Sql.Count(this.sqlFindUserParameters())
    }

    generateDemoData() {
        return new DemoGenerate({ db: this.db, tenant: this.value("tenant") }).generate()
    }

    sql() {
        return this.sqlInsert({
            tableName: "users",
            values: this.values()
        })
    }

}

class UsersRegisterTestService extends UsersRegisterService {

    execute() {
        this.preValidate()
            .then(() =>
                super.execute())
            .catch(err =>
                this.sendError(err)
            )
    }

    preValidate() {
        return this.dbSelectOne(this.sqlSelectUser())
            .then(row => {
                if (row != undefined) {
                    return this.dbExecute(this.sqlDelete(row.tenant))
                } else {
                    return undefined;
                }
            })
    }

    sqlSelectUser() {
        return this.sqlSelect({
            columns: ["tenant"],
            from: "users",
            filterByTenant: false,
            where: this.sqlAnd("email=@email"),
            parameters: { email: this.value("email") }
        })
    }

    sqlDelete(tenant) {
        return new Sqls().addArray([
            this.sqlDeleteAll({
                tableName: "users_states", values: { tenant: tenant }
            }),
            this.sqlDeleteAll({
                tableName: "users", values: { tenant: tenant }

            })
        ]).text()
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
        if (Utils.IsNotDefined(user)) {
            throw Exceptions.UserEmailNotFound()
        } else if (Utils.Decrypt(user.password) != this.value("password")) {
            throw Exceptions.UserInvalidPassword();
        }
        return user
    }

    newToken(user) {
        return this.app.newToken(user);
    }

}


module.exports.UsersRegisterService = UsersRegisterService;
module.exports.UsersRegisterTestService = UsersRegisterTestService;
module.exports.UsersLoginService = UsersLoginService;