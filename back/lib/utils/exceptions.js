const { Http } = require("./http");
const { Utils } = require("./utils");

class Exceptions {

    static INVALID_TOKEN = 1000;

    static InvalidToken(detail) {
        return new Exception({
            status: Http.Unauthorized,
            code: Exceptions.INVALID_TOKEN,
            message: "Token inválido",
            detail: detail,
            isTokenInvalid: true,
        })
    }

    static DataBase(detail) {
        return new Exception({
            message: "Error de base de datos",
            detail: detail
        })
    }

    static RequiredValue(detail) {
        return new Exception({
            status: Http.InvalidRequest,
            message: "Valor requerido",
            detail: detail,
            isValidation: true
        })
    }

    static SqlParameterValueNotFound(detail) {
        return new Exception({
            message: "Valor de parámetro SQL no encontrado",
            detail: detail
        })
    }

    static TenantNotDefined(detail) {
        return new Exception({
            status: Http.Unauthorized,
            message: "Tenant no definido",
            detail: detail
        })
    }

    static IdNotDefined(detail) {
        return new Exception({
            message: "Valor de id no definido",
            detail: detail
        });
    }

    static NotImplemented(detail) {
        return new Exception({
            message: "No implementado",
            detail: detail
        });
    }

    static DuplicatedEmail(detail) {
        return new Exception({
            status: Http.InvalidRequest,
            message: "Email duplicado",
            detail: detail,
            isValidation: true
        });
    }

    static DuplicatedEntity(detail) {
        return new Exception({
            status: Http.InvalidRequest,
            detail: detail,
            isValidation: true
        });
    }

    static InvalidEmailPassword(detail) {
        return new Exception({
            status: Http.InvalidRequest,
            message: "Email o password inválidos",
            detail: detail,
            isValidation: true
        });
    }

    static Validation(parameters) {
        return new Exception({
            status: Http.InvalidRequest,
            message: parameters.message,
            detail: parameters.detail,
            isValidation: true
        })
    }

}

class Exception {

    constructor(parameters = {}) {
        this.status = parameters.status;
        this.code = parameters.code;
        this.message = Utils.Concatenate([parameters.message, parameters.detail], ": ")
        this.isValidation = parameters.isValidation;
        this.isTokenInvalid = parameters.isTokenInvalid;
    }

}

module.exports.Exceptions = Exceptions;
module.exports.Exception = Exception;