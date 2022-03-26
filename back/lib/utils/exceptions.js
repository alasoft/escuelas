class Exceptions {

    static INVALID_TOKEN = 1000;

    static InvalidToken(detail) {
        return new Exception({
            code: Exceptions.INVALID_TOKEN,
            message: "token inválido",
            detail: detail
        })
    }

    static DataBase(detail) {
        return new Exception({
            message: "error de base de datos",
            detail: detail
        })
    }

    static RequiredValue(detail) {
        return new Exception({
            message: "valor requerido",
            detail: detail
        })
    }

    static ParameterValueNotFound(detail) {
        return new Exception({
            message: "valor de parámetro no encontrado",
            detail: detail
        })
    }

    static TenantNotDefined(detail) {
        return new Exception({
            message: "tenant no definido",
            detail: detail
        })
    }

    static IdNotDefined(detail) {
        return new Exception({
            message: "id no definido",
            detail: detail
        });
    }

    static NotImplemented(detail) {
        return new Exception({
            message: "no implementedo",
            detail: detail
        });
    }

    static DuplicatedEmail(detail) {
        return new Exception({
            message: "email duplicado",
            detail: detail
        });
    }

    static DuplicatedEntity(detail) {
        return new Exception({
            message: "duplicado",
            detail: detail
        });
    }

    static InvalidEmailPassword(detail) {
        return new Exception({
            message: "email o password inváldos",
            detail: detail
        });
    }

}

class Exception {

    constructor(parameters = {}) {
        this.code = parameters.code;
        this.message = parameters.message + (parameters.detail != undefined ? ": " + detail : "");
    }

}

module.exports.Exceptions = Exceptions;