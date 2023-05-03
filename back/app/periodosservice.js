const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");
const { Dates } = require("../lib/utils/utils");
const { Exceptions } = require("../lib/utils/exceptions.js");
const { ServiceBase } = require("../lib/service/servicebase");

class PeriodosServiceBase extends ServiceBase {

    static sqlList() {
        return {
            columns: [
                "per.id",
                "per.añolectivo",
                "per.nombre",
                "per.desde",
                "per.hasta",
                "per.preliminar",
            ],
            from: "periodos per"
        }
    }

}

class PeriodosListService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "per.id",
                "per.nombre",
                "per.desde",
                "per.hasta",
                "per.preliminar",
            ],
            from: "periodos per",
            where: this.sqlAnd()
                .addIf(this.isDefined("añolectivo"), () =>
                    this.sqlText("per.añolectivo=@añolectivo", {
                        añolectivo: this.value("añolectivo")
                    }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("per.nombre ilike @descripcion", {
                        descripcion: this.value("descripcion")
                    })
                ),
            order: "per.desde"
        }
    }

}

class PeriodosGetService extends TableGetService {

    sqlParameters() {
        return {
            columns: [
                "per.id",
                "per.nombre",
                "per.desde",
                "per.hasta",
                "per.preliminar",
            ],
            from: "periodos per",
            where: "id=@id",
            parameters: { id: this.id() }
        }
    }

}

class PeriodosInsertService extends TableInsertService {

    validate() {
        return super.validate()
            .then(() =>
                PeriodosCommonService.Validate(this))
    }

    requiredValues() {
        return "añolectivo,nombre,desde,hasta"
    }

    sqlNotDuplicated() {
        return PeriodosCommonService.SqlNotDuplicated(this);
    }

}

class PeriodosUpdateService extends TableUpdateService {

    validate() {
        return super.validate()
            .then(() =>
                PeriodosCommonService.Validate(this))
    }

    sqlNotDuplicated() {
        return PeriodosCommonService.SqlNotDuplicated(this);
    }

}

class PeriodosDeleteService extends TableDeleteService {

}

class PeriodosCommonService {

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            columns: "id",
            from: "Periodos",
            where: service.sqlAnd([
                "upper(nombre)=upper(@nombre)"
            ]),
            parameters: service.jsonValues("nombre")
        })
    }

    static Validate(service) {
        return Promise.resolve()
            .then(() =>
                this.ValidateDesdeMenorHasta(service))
            .then(() =>
                this.ValidaDesdeInAñoLectivo(service))
            .then(() =>
                this.ValidaHastaInAñoLectivo(service))
            .then(() =>
                this.ValidateNoDateCollision(service))
            .then(() =>
                this.ValidatePreliminar(service))
            .then(() =>
                this.ValidateNoTpCollision(service))
    }

    static ValidateDesdeMenorHasta(service) {
        if (service.date("hasta") <= service.date("desde")) {
            throw Exceptions.Validation({
                code: Exceptions.FECHA_DESDE_DEBE_SER_MENOR_FECHA_HASTA
            })
        }
    }

    static ValidaDesdeInAñoLectivo(service) {
        if (Dates.YearOf(service.date("desde")) != service.value("añolectivo")) {
            throw Exceptions.Validation({
                code: Exceptions.FECHA_DESDE_DEBE_ESTAR_EN_AÑO_LECTIVO,
            })
        }
    }

    static ValidaHastaInAñoLectivo(service) {
        if (Dates.YearOf(service.date("hasta")) != service.value("añolectivo")) {
            throw Exceptions.Validation({
                code: Exceptions.FECHA_HASTA_DEBE_ESTAR_EN_AÑO_LECTIVO,
            })
        }
    }

    static ValidateNoDateCollision(service) {

        function sql() {
            return service.sqlSelect({
                columns: [
                    "per.id",
                    "per.nombre",
                    "per.desde",
                    "per.hasta",
                ],
                from: "periodos per",
                where: service.sqlAnd()
                    .addIf(service.id() != undefined, () => service.sqlText("id<>@id", { id: service.id() }))
                    .add(service.sqlText("per.añolectivo=@añolectivo", {
                        añolectivo: service.value("añolectivo")
                    }))
            })
        }

        function validateRanges(rows) {
            rows.forEach(row => {
                if (Dates.Intersect(service.date("desde"), service.date("hasta"), row.desde, row.hasta)) {
                    throw Exceptions.Validation({
                        code: Exceptions.PERIODO_INTERSECTA_OTRO_PERIODO,
                        detail: row
                    })
                }
                if (Dates.Contains(service.date("desde"), service.date("hasta"), row.desde, row.hasta)) {
                    throw Exceptions.Validation({
                        code: Exceptions.PERIODO_CONTIENE_OTRO_PERIODO,
                        detail: row
                    })
                }
            })
        }

        return service.db.select(sql()).then(
            rows => validateRanges(rows)
        )

    }

    static ValidatePreliminar(service) {
        if (service.isDefined("preliminar")) {
            if (!Dates.Between(service.date("preliminar"), service.date("desde"), service.date("hasta"))) {
                throw Exceptions.Validation({
                    code: Exceptions.PRELIMINAR_DEBE_ESTAR_ENTRE_DESDE_HASTA,
                    detail: row
                })
            }
        }
    }

    static ValidateNoTpCollision(service) {

        function sql() {
            return service.sqlSelect({
                columns: [
                    "ex.nombre",
                    "ex.desde",
                    "ex.hasta",
                    "mat.nombre as materianombre"
                ],
                from: "examenes ex",
                joins: [
                    { tableName: "materias_cursos", alias: "mc", columnName: "ex.materiacurso" },
                    { tableName: "materias", alias: "mat", columnName: "mc.materia" }
                ],
                where: service.sqlAnd()
                    .add(service.sqlText("ex.periodo=@periodo", {
                        periodo: service.id()
                    }))
                    .add(service.sqlText("not (ex.desde>=@desde and ex.hasta<=@hasta)", {
                        desde: service.date("desde"),
                        hasta: service.date("hasta")
                    }))
            })
        }
        if (service.isDefined(service.id())) {
            return service.db.select(sql()).then(rows => {
                if (0 < rows.length) {
                    throw Exceptions.Validation()
                }
            })
        }
    }

}

module.exports.PeriodosServiceBase = PeriodosServiceBase;
module.exports.PeriodosListService = PeriodosListService;
module.exports.PeriodosGetService = PeriodosGetService
module.exports.PeriodosInsertService = PeriodosInsertService;
module.exports.PeriodosUpdateService = PeriodosUpdateService;
module.exports.PeriodosDeleteService = PeriodosDeleteService;