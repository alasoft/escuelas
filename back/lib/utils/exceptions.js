const { Http } = require("./http");
const { Utils } = require("./utils");

class Exceptions {

    static AUTHENTICATION = "authentication"
    static INVALID_TOKEN = "invalidToken";
    static VALIDATION = "validation";
    static INTERNAL = "internal";

    static InvalidToken(detail) {
        return new Exception({
            type: Exceptions.INVALID_TOKEN,
            message: "Token inválido",
            detail: detail
        })
    }

    static DataBase(parameters) {
        return new Exception({
            type: Exceptions.INTERNAL,
            message: "Error de base de datos",
            sql: parameters.sql,
            detail: parameters.detail
        })
    }

    static RequiredValue(detail) {
        return new Exception({
            type: Exceptions.VALIDATION,
            message: "Valor requerido",
            detail: detail,
        })
    }

    static SqlParameterValueNotFound(detail) {
        return new Exception({
            type: Exceptions.INTERNAL,
            message: "Valor de parámetro SQL no encontrado",
            detail: detail
        })
    }

    static TenantNotDefined(detail) {
        return new Exception({
            type: Exceptions.AUTHENTICATION,
            message: "Tenant no definido",
            detail: detail
        })
    }

    static IdNotDefined(detail) {
        return new Exception({
            type: Exceptions.INTERNAL,
            message: "Valor de id no definido",
            detail: detail
        });
    }

    static UserNotExists(detail) {
        return new Exception({
            type: Exceptions.AUTHENTICATION,
            message: "Usuario inexistente",
            detail: detail
        })
    }

    static NotImplemented(detail) {
        return new Exception({
            type: Exceptions.INTERNAL,
            message: "No implementado",
            detail: detail
        });
    }

    static DuplicatedEmail(detail) {
        return new Exception({
            type: Exceptions.VALIDATION,
            message: "Email duplicado",
            detail: detail,
        });
    }

    static DuplicatedEntity(detail) {
        return new Exception({
            type: Exceptions.VALIDATION,
            message: message,
            detail: detail
        });
    }

    static InvalidEmailPassword(detail) {
        return new Exception({
            type: Exceptions.VALIDATION,
            message: "Email o password inválidos",
            detail: detail,
        });
    }

    static Validation(parameters) {
        return new Exception({
            type: Exceptions.VALIDATION,
            message: parameters.message || "Error de validación",
        })
    }

    static ForeignKeyReferenceNotDefined(detail) {
        return new Exception({
            type: Exceptions.INTERNAL,
            message: "Campo de clave foranea sin Tabla de referencia",
            detail: detail
        })
    }

}

class Exception extends Object {

    constructor(parameters = {}) {
        super();
        this.type = parameters.type;
        this.status = this.status();
        this.message = parameters.message;
        this.detail = parameters.detail;
        this.sql = parameters.sql;
    }

    status(type) {
        if (type == Exceptions.AUTHENTICATION) {
            return Http.Unauthorized;
        }
        if (type == Exceptions.INVALID_TOKEN) {
            return Http.Unauthorized;
        }
        if (type == Exceptions.VALIDATION) {
            return Http.InvalidRequest;
        }
        return Http.Internal;
    }

}

module.exports.Exceptions = Exceptions;
module.exports.Exception = Exception;