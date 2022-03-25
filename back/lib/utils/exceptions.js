const { Http } = require("./http");

class Exceptions {

    static Exception(message, detail, status) {
        return new Exception(status, message, detail)
    }

    static InvalidToken(detail) {
        return this.Exception("token inválido", detail)
    }

    static DataBase(detail) {
        return this.Exception("error de base de datos", detail)
    }

    static RequiredValue(detail) {
        return this.Exception("valor requerido", detail, Http.InvalidRequest)
    }

    static ParameterValueNotFound(detail) {
        return this.Exception("valor de parámetro no encontrado", detail)
    }

    static TenantNotDefined(detail) {
        return this.Exception("tenant no definido", detail)
    }

    static IdNotDefined(detail) {
        return this.Exception("id no definido", detail);
    }

    static NotImplemented(detail) {
        return this.Exception("no implementedo", detail);
    }

    static DuplicatedEmail(detail) {
        return this.Exception("email duplicado", detail);
    }

    static DuplicatedEntity(detail) {
        return this.Exception("duplicado", detail);
    }

    static InvalidEmailPassword(detail) {
        return this.Exception("email o password inváldos", detail);
    }


}

class Exception {

    constructor(status, message, detail) {
        this.status = status || Http.Internal;
        this.message = message + (detail != undefined ? ": " + detail : "");
    }

}

module.exports.Exceptions = Exceptions;