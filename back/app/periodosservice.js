const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");
const { Dates } = require("../lib/utils/dates");
const { Exceptions } = require("../lib/utils/exceptions");

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

    }

    static ValidateDesdeLowerHasta(service) {
        if (service.value("hasta") <= service.value("desde")) {
            throw Exceptions.DesdeNotLowerHasta(
                "<br><br>desde = " +
                Dates.Format(service.value("desde")) +
                "<br>hasta = " +
                Dates.Format(service.value("hasta"))
            )
        }
    }

    static ValidaDesdeInAñoLectivo(service) {
        if (Dates.YearOf(service.value("date")) != service.value("añolectivo")) {
            throw Exceptions.DesdeOutOfAñoLectivo(
                "<br><br>desde = " +
                Dates.Format(service.value("desde")) +
                "<br>año lectivo = " + service.value("añolectivo")
            )
        }
    }

    static ValidateNoDateCollision(service) {

    }

}

module.exports.PeriodosListService = PeriodosListService;
module.exports.PeriodosGetService = PeriodosGetService
module.exports.PeriodosInsertService = PeriodosInsertService;
module.exports.PeriodosUpdateService = PeriodosUpdateService;
module.exports.PeriodosDeleteService = PeriodosDeleteService;