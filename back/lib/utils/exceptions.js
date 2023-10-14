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
    static SQL_WHERE_NOT_DEFINED = "sqlWhereNotDefined"
    static USER_NOT_EXISTS = "userNotExists"
    static USER_EMAIL_NOT_FOUND = "userEmailNotFound"
    static USER_INVALID_PASSWORD = "userInvalidPassword"
    static FOREIGN_KEY_REFERENCE_NOT_DEFINED = "foreignKeyReferenceNotDefined"
    static NOT_IMPLEMENTED = "notImplemented"
    static APELLIDO_NOMBRE_DUPLICATED = "apellidoNombreDuplicated"
    static EMAIL_DUPLICATED = "emailDuplicated"
    static NOTA_OUT_OF_RANGE = "notaOutOfRange"
    static MATERIA_CURSO_NOT_FOUND = "materiaCursoNotFound"

    static FECHA_DESDE_DEBE_SER_MENOR_FECHA_HASTA = "fechaDesdeDebeSerMenorFechaHasta"
    static FECHA_DESDE_DEBE_ESTAR_EN_AÑO_LECTIVO = "fechaDesdeDebeEstarEnAñoLectivo"
    static FECHA_HASTA_DEBE_ESTAR_EN_AÑO_LECTIVO = "fechaHastaDebeEstarEnAñoLectivo"
    static PERIODO_INTERSECTA_OTRO_PERIODO = "periodoIntersectaOtroPeriodo"
    static PERIODO_CONTIENE_OTRO_PERIODO = "periodoContieneOtroPeriodo"
    static FECHA_ENTREGA_DEBER_SER_MAYOR_IGUAL_INICIO = "fechaEntregaDebeSerMayorIgualInicio"
    static DEBE_ESTAR_DENTRO_PERIODO = "debeEstarDentroPeriodo"
    static PRELIMINAR_DEBE_ESTAR_ENTRE_DESDE_HASTA = "preliminarDebeEsterEntreDesdeHasta"

    static NOTA_DESDE_DEBE_SER_MENOR_IGUAL_NOTA_HASTA = "notaDesdeDebeSerMenorIgualNotaHasta"
    static RANGO_NOTAS_INTERSECTA_OTRO_RANGO = "rangoNotasIntersectaOtroRango"
    static RANGO_NOTAS_CONTIENE_OTRO_RANGO = "rangoNotasContieneOtroRango"
    static SIGLA_DUPLICATED = "siglaDuplicated"
    static FILE_NOT_FOUND = "fileNotFound"

    static HORA_DESDE_DEBE_SER_MENOR_HORA_HASTA = "horaDesdeDebeSerMenorHoraHasta"
    static HORARIO_COLISION = "horarioColision"

    static MAX_ALUMNOS_ALLOWED_FOR_DEMO = "maxAlumnosAllowedForDemo"

    static FileNotFound() {
        return new Exception({
            type: this.TYPE_INTERNAL,
            code: this.FILE_NOT_FOUND
        }, p)
    }

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
        }, p)
    }

    static SqlParameterValueNotFound(p) {
        return new Exception({
            type: this.TYPE_INTERNAL,
            code: this.SQL_PARAMETER_VALUE_NOT_FOUND,
            message: "No esta definido un parámetro SQL"
        }, p)
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
            code: this.ID_NOT_DEFINED,
            message: "Id not defined"
        }, p);
    }

    static WhereNotDefined(p) {
        return new Exception({
            type: this.TYPE_INTERNAL,
            code: SQL_WHERE_NOT_DEFINED
        }, p)
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

    static DuplicatedApellidoNombre(p) {
        return new Exception({
            type: this.TYPE_VALIDATION,
            code: this.APELLIDO_NOMBRE_DUPLICATED,
        }, p);
    }


    static DuplicatedEmail(p) {
        return new Exception({
            type: this.TYPE_VALIDATION,
            code: this.EMAIL_DUPLICATED,
        }, p);
    }

    static UserEmailNotFound(p) {
        return new Exception({
            type: this.TYPE_AUTHENTICATION,
            code: this.USER_EMAIL_NOT_FOUND
        });
    }

    static UserInvalidPassword(p) {
        return new Exception({
            type: this.TYPE_AUTHENTICATION,
            code: this.USER_INVALID_PASSWORD
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

    static HoraDesdeDebeSerMenorHoraHasta(p) {
        return new Exception({
            type: this.TYPE_VALIDATION,
            code: this.HORA_DESDE_DEBE_SER_MENOR_HORA_HASTA
        }, p)
    }

    static HorarioColision(p) {
        return new Exception({
            type: this.TYPE_VALIDATION,
            code: this.HORARIO_COLISION
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
        this.status = Exception.Status(this.type);
    }

    static Status(type) {
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