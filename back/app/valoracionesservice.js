const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");
const { Exceptions } = require("../lib/utils/exceptions.js");
const { Numbers } = require("../lib/utils/utils");

class ValoracionesListService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "vlr.id",
                "vlr.nombre",
                "vlr.sigla",
                "vlr.desde",
                "vlr.hasta"
            ],
            from: "valoraciones vlr",
            where: this.sqlAnd()
                .addIf(this.isDefined("añolectivo"), () =>
                    this.sqlText("vlr.añolectivo=@añolectivo", {
                        añolectivo: this.value("añolectivo")
                    }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("vlr.nombre ilike @descripcion", {
                        descripcion: this.value("descripcion")
                    })
                ),
            order: "vlr.desde"
        }
    }

}

class ValoracionesGetService extends TableGetService {

    sqlParameters() {
        return {
            columns: [
                "vlr.id",
                "vlr.nombre",
                "vlr.sigla",
                "vlr.desde",
                "vlr.hasta"
            ],
            from: "valoraciones vlr",
            where: "id=@id",
            parameters: { id: this.id() }
        }
    }

}

class ValoracionesInsertService extends TableInsertService {

    validate() {
        return super.validate()
            .then(() =>
                ValoracionesCommonService.ValidateSiglaNotDuplicated(this))
            .then(() =>
                ValoracionesCommonService.ValidateDesdeHasta(this))
    }

    requiredValues() {
        return "añolectivo,nombre,desde,hasta"
    }

    sqlNotDuplicated() {
        return ValoracionesCommonService.SqlNotDuplicated(this);
    }

}

class ValoracionesUpdateService extends TableUpdateService {

    validate() {
        return super.validate()
            .then(() =>
                ValoracionesCommonService.ValidateSiglaNotDuplicated(this))
            .then(() =>
                ValoracionesCommonService.ValidateDesdeHasta(this))
    }

    sqlNotDuplicated() {
        return ValoracionesCommonService.SqlNotDuplicated(this);
    }

}

class ValoracionesDeleteService extends TableDeleteService {

}

class ValoracionesCommonService {

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "Valoraciones",
            where: service.sqlAnd([
                "upper(nombre)=upper(@nombre)"
            ]),
            parameters: service.jsonValues("nombre")
        })
    }

    static ValidateSiglaNotDuplicated(service) {
        return service.dbSelect(this.SqlSiglaNotDuplicated(service)).then(rows => {
            if (1 < rows.length || (rows.length == 1 && rows[0].id != service.id())) {
                throw Exceptions.Validation({ code: Exceptions.SIGLA_DUPLICATED })
            }
        })
    }

    static SqlSiglaNotDuplicated(service) {
        return service.sqlSelect({
            from: "Valoraciones",
            where: service.sqlAnd([
                "upper(sigla)=upper(@sigla)"
            ]),
            parameters: service.jsonValues("sigla")
        })
    }

    static ValidateDesdeHasta(service) {
        this.ValidateDesdeLowerHasta(service);
        return this.ValidateNoRangeCollision(service);
    }

    static ValidateDesdeLowerHasta(service) {
        if (service.value("hasta") < service.value("desde")) {
            throw Exceptions.Validation({
                code: Exceptions.NOTA_DESDE_DEBE_SER_MENOR_IGUAL_NOTA_HASTA
            })
        }
    }

    static ValidateNoRangeCollision(service) {

        function sql() {
            return service.sqlSelect({
                columns: [
                    "vlr.id",
                    "vlr.sigla",
                    "vlr.desde",
                    "vlr.hasta"
                ],
                from: "valoraciones vlr",
                where: service.sqlAnd()
                    .addIf(service.id() != undefined, () => service.sqlText("id<>@id", { id: service.id() }))
                    .add(service.sqlText("vlr.añolectivo=@añolectivo", {
                        añolectivo: service.value("añolectivo")
                    }))
            })
        }

        function validateRanges(rows) {
            rows.forEach(row => {
                if (Numbers.Intersect(service.value("desde"), service.value("hasta"), row.desde, row.hasta)) {
                    throw Exceptions.Validation({
                        code: Exceptions.RANGO_NOTAS_INTERSECTA_OTRO_RANGO,
                        detail: row
                    })
                }
                if (Numbers.Contains(service.value("desde"), service.value("hasta"), row.desde, row.hasta)) {
                    throw Exceptions.Validation({
                        code: Exceptions.RANGO_NOTAS_CONTIENE_OTRO_RANGO,
                        detail: row
                    })
                }
            })
        }

        return service.db.select(sql()).then(
            rows => validateRanges(rows)
        )

    }

}

module.exports.ValoracionesListService = ValoracionesListService;
module.exports.ValoracionesGetService = ValoracionesGetService
module.exports.ValoracionesInsertService = ValoracionesInsertService;
module.exports.ValoracionesUpdateService = ValoracionesUpdateService;
module.exports.ValoracionesDeleteService = ValoracionesDeleteService;