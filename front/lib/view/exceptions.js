class Exceptions {

    static SERVER_SIDE = "server";
    static CLIENT_SIDE = "client";

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

}