const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");
const { Dates } = require("../lib/utils/dates");
const { Exceptions } = require("../lib/utils/exceptions.js");

class PeriodosListService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "per.id",
                "per.nombre",
                "per.desde",
                "per.hasta"
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
                "per.hasta"
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
                PeriodosCommonService.ValidateDesdeHasta(this))
    }

    requiredValues() {
        return "añolectivo,nombre,desde,hasta"
    }

    sqlNotDuplicated() {
        return PeriodosCommonService.SqlNotDuplicated(this);
    }

    duplicatedMessage() {
        return PeriodosCommonService.DuplicatedMessage();
    }

}

class PeriodosUpdateService extends TableUpdateService {

    validate() {
        return super.validate()
            .then(() =>
                PeriodosCommonService.ValidateDesdeHasta(this))
    }

    sqlNotDuplicated() {
        return PeriodosCommonService.SqlNotDuplicated(this);
    }

    duplicatedMessage() {
        return PeriodosCommonService.DuplicatedMessage();
    }

}

class PeriodosDeleteService extends TableDeleteService {

}

class PeriodosCommonService {

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "Periodos",
            where: service.sqlAnd([
                "upper(nombre)=upper(@nombre)"
            ]),
            parameters: service.jsonValues("nombre")
        })
    }

    static DuplicatedMessage() {
        return "Período con nombre duplicado";
    }

    static ValidateDesdeHasta(service) {
        this.ValidateDesdeLowerHasta(service);
        this.ValidaDesdeInAñoLectivo(service)
        return this.ValidateNoDateCollision(service);
    }

    static ValidateDesdeLowerHasta(service) {
        if (service.date("hasta") <= service.date("desde")) {
            throw Exceptions.Validation({
                message: "La fecha desde debe ser menor a la fecha hasta",
                detail: this.DetailDesdeHasta(service)
            })
        }
    }

    static ValidaDesdeInAñoLectivo(service) {
        if (Dates.YearOf(service.date("desde")) != service.value("añolectivo")) {
            throw Exceptions.Validation({
                message: "La fecha desde debe estar dentro del año lectivo",
                detail: "<br><br>desde = " +
                    Dates.Format(service.date("desde")) +
                    "<br>año lectivo = " + service.value("añolectivo")
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
                    "per.hasta"
                ],
                from: "periodos per",
                where: service.sqlAnd()
                    .addIf(service.id() != undefined, () => service.sqlText("id<>@id", { id: service.id() }))
                    .add(service.sqlText("per.añolectivo=@añolectivo", {
                        añolectivo: service.value("añolectivo")
                    }))
            })
        }

        function validateCollision(rows) {
            rows.forEach(row => {
                if (
                    Dates.Intersect(service.date("desde"), service.date("hasta"), row.desde, row.hasta) ||
                    Dates.Contains(service.date("desde"), service.date("hasta"), row.desde, row.hasta)
                ) {
                    throw Exceptions.Validation({
                        message: "El " + service.value("nombre") + " choca con el " + row.nombre,
                        detail: PeriodosCommonService.DetailDesdeHasta(service) + PeriodosCommonService.RowDetailDesdeHasta(row)
                    })
                }

            })
        }

        return service.db.select(sql()).then(
            rows => validateCollision(rows)
        )

    }

    static DetailDesdeHasta(service) {
        return "<br><br>" + service.value("nombre") +
            "<br>desde = " +
            Dates.Format(service.date("desde")) +
            "<br>hasta = " +
            Dates.Format(service.date("hasta"))
    }

    static RowDetailDesdeHasta(row) {
        return "<br><br>" + row.nombre +
            "<br>desde = " +
            Dates.Format(row.desde) +
            "<br>hasta = " +
            Dates.Format(row.hasta)
    }

}

module.exports.PeriodosListService = PeriodosListService;
module.exports.PeriodosGetService = PeriodosGetService
module.exports.PeriodosInsertService = PeriodosInsertService;
module.exports.PeriodosUpdateService = PeriodosUpdateService;
module.exports.PeriodosDeleteService = PeriodosDeleteService;