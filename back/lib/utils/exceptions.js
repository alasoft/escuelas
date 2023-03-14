const { Http } = require("./http");
const { Utils } = require("./utils");

class Exceptions {

    static SERVER_SIDE = "server";

    static TYPE_AUTHENTICATION = "authentication"
    static TYPE_VALIDATION = "validation";
    static TYPE_INTERNAL = "internal";

    static INVALID_TOKEN = "invalidToken";
    static DUPLICATED_ENTITY = "duplicatedEntity";
    static DATABASE = "database";
    static REQUIRED_VALUE = "requiredValues"
    static SQL_PARAMETER_VALUE_NOT_FOUND = "sqlParameterValueNotFound"
    static TENANT_NOT_DEFINED = "Tenant no definido"
    static ID_NOT_DEFINED = "idNotDefined"
    static USER_NOT_EXISTS = "userNotExists"
    static INVALID_EMAIL_PASSWORD = "invalidEmailPassword"
    static FOREIGN_KEY_REFERENCE_NOT_DEFINED = "foreignKeyReferenceNotDefined"
    static NOT_IMPLEMENTED = "notImplemented"

    static FECHA_DESDE_DEBE_SER_MENOR_FECHA_HASTA = "fechaDesdeDebeSerMenorFechaHasta"
    static FECHA_DESDE_DEBE_ESTAR_EN_AÑO_LECTIVO = "fechaDesdeDebeEstarEnAñoLectivo"
    static FECHA_HASTA_DEBE_ESTAR_EN_AÑO_LECTIVO = "fechaHastaDebeEstarEnAñoLectivo"
    static PERIODO_INTERSECTA_OTRO_PERIODO = "periodoIntersectaOtroPeriodo"
    static PERIODO_CONTIENE_OTRO_PERIODO = "periodoContieneOtroPeriodo"
    static FECHA_INICIO_DEBE_SER_MENOR_FECHA_ENTREGA = "fechaInicioDebeSerMenorFechaEntrega"
    static DEBE_ESTAR_DENTRO_PERIODO = "debeEstarDentroPeriodo"

    static InvalidToken(p) {
        return new Exception({
            type: this.TYPE_AUTHENTICATION,
            code: this.INVALID_TOKEN
        })
    }

    static DuplicatedEntity(p) {
        return new Exception({
            type: this.TYPE_VALIDATION,
            code: this.DUPLICATED_ENTITY,
        });
    }

    static DataBase(p) {
        return new Exception({
            type: this.TYPE_INTERNAL,
            code: this.DATABASE
        }, p)
    }

    static RequiredValue(p) {
        return new Exception({
            type: this.TYPE_VALIDATION,
            code: this.REQUIRED_VALUE
        })
    }

    static SqlParameterValueNotFound(p) {
        return new Exception({
            type: this.TYPE_INTERNAL,
            code: this.SQL_PARAMETER_VALUE_NOT_FOUND
        })
    }

    static TenantNotDefined(p) {
        return new Exception({
            type: this.TYPE_INTERNAL,
            code: this.TENANT_NOT_DEFINED,
        })
    }

    static IdNotDefined(p) {
        return new Exception({
            type: this.TYPE_INTERNAL,
            message: this.ID_NOT_DEFINED,
        });
    }

    static UserNotExists(p) {
        return new Exception({
            type: this.TYPE_AUTHENTICATION,
            code: this.USER_NOT_EXISTS
        })
    }

    static NotImplemented(p) {
        return new Exception({
            type: this.TYPE_INTERNAL,
            code: this.NOT_IMPLEMENTED,
        });
    }

    static DuplicatedEmail(p) {
        return new Exception({
            type: Exceptions.VALIDATION,
            message: "Email duplicado",
            detail: detail,
        });
    }

    static InvalidEmailPassword(p) {
        return new Exception({
            type: this.TYPE_VALIDATION,
            code: this.INVALID_EMAIL_PASSWORD
        });
    }

    static Validation(p) {
        return new Exception({
            type: this.TYPE_VALIDATION,
        }, p)
    }

    static ForeignKeyReferenceNotDefined(p) {
        return new Exception({
            type: this.TYPE_INTERNAL,
            code: FOREIGN_KEY_REFERENCE_NOT_DEFINED
        }, p)
    }

}

class Exception {

    constructor(p1, p2) {
        const parameters = Utils.Merge(p1, p2);
        this.side = Exceptions.SERVER_SIDE;
        this.type = parameters.type;
        this.code = parameters.code;
        this.message = parameters.message;
        this.detail = parameters.detail;
        this.status = this.status();
    }

    status(type) {
        if (type == Exceptions.TYPE_AUTHENTICATION) {
            return Http.Unauthorized;
        }
        if (type == Exceptions.TYPE_INVALID_TOKEN) {
            return Http.Unauthorized;
        }
        if (type == Exceptions.TYPE_VALIDATION) {
            return Http.InvalidRequest;
        }
        return Http.Internal;
    }

}

module.exports.Exceptions = Exceptions;
module.exports.Exception = Exception;