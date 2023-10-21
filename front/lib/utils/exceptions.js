class Exceptions {

    // Server Side

    static SERVER_SIDE = "server";

    static TYPE_AUTHENTICATION = "authentication"
    static TYPE_VALIDATION = "validation";
    static TYPE_INTERNAL = "internal";

    static INVALID_TOKEN = "invalidToken";
    static DUPLICATED_ENTITY = "duplicatedEntity";
    static DATABASE = "database";
    static REQUIRED_VALUE = "requiredValues"
    static SQL_PARAMETER_VALUE_NOT_FOUND = "sqlParameterValueNotFound"
    static TENANT_NOT_DEFINED = "tenantNotDefined"
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

    static MAX_ALUMNOS_ALLOWED_FOR_DEMO = "maxAlumnosAllowedForDemo"

    static HORA_DESDE_DEBE_SER_MENOR_HORA_HASTA = "horaDesdeDebeSerMenorHoraHasta"
    static HORARIO_COLISION = "horarioColision"

    // Client Side 

    static CLIENT_SIDE = "client";

    static FORM_VALIDATION = "formValidation"
    static MAIL_INGRESADO_NO_COINCIDE_CON_REPETICION = "mailIngresadoNoCoincideConRepeticion";
    static PASSWORD_INGRESADO_TIENE_MENOS_8_CARACTERES = "mailIngresadoTieneMenos8Caracteres";
    static PASSWORD_INGRESADO_NO_COINCIDE_CON_REPETICION = "passwordIngresadoNoCoincideConRepeticion"

    static Validation(p) {
        return Utils.Merge({
            side: Exceptions.CLIENT_SIDE,
            type: this.TYPE_VALIDATION,
        }, p)
    }

    static NotImplemented(p) {
        return Utils.Merge({
            side: Exceptions.CLIENT_SIDE,
            type: Exceptions.TYPE_INTERNAL
        }, p)
    }

    static FormValidation() {
        return this.Validation({ code: this.FORM_VALIDATION })
    }

}