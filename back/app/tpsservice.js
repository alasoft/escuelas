const { Dates } = require("../lib/utils/dates");
const { Exceptions } = require("../lib/utils/exceptions");
const { Utils } = require("../lib/utils/utils");
const { Messages } = require("../lib/utils/messages");
const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");

class TpsListService extends TableListService {

    sqlParameters() {
        return Utils.Merge(
            TpsCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: this.sqlAnd()
                .add(this.sqlText("tp.materiacurso=@materiacurso", { materiacurso: this.value("materiacurso") }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("tp.nombre ilike @nombre", { nombre: this.sqlLike(this.value("descripcion")) })),
            order: [
                "per.desde",
                "tp.desde",
                "tp.nombre"
            ]
        }
    }

}

class TpsGetService extends TableGetService {

    sqlParameters() {
        return Utils.Merge(
            TpsCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: "tp.id=@id",
            parameters: { id: this.id() }
        }
    }

}

class TpsInsertService extends TableInsertService {

    validate() {
        return super.validate()
            .then(() =>
                TpsCommonService.ValidateDesdeHasta(this))
    }

    requiredValues() {
        return "materiacurso,periodo,nombre,desde,hasta"
    }

    sqlNotDuplicated() {
        return TpsCommonService.SqlNotDuplicated(this);
    }

    duplicatedMessage() {
        return TpsCommonService.DuplicatedMessage();
    }

}

class TpsUpdateService extends TableUpdateService {

    validate() {
        return super.validate()
            .then(() =>
                TpsCommonService.ValidateDesdeHasta(this))
    }

    sqlNotDuplicated() {
        return TpsCommonService.SqlNotDuplicated(this);
    }
    duplicatedMessage() {
        return TpsCommonService.DuplicatedMessage();
    }

}

class TpsDeleteService extends TableDeleteService {}


class TpsCommonService {

    static SqlBaseParameters(service) {
        return {
            columns: [
                "tp.id",
                "tp.materiacurso",
                "tp.periodo",
                "tp.nombre",
                "tp.desde",
                "tp.hasta",
                "per.nombre as periodonombre"
            ],
            from: "tps tp",
            joins: [
                { tableName: "periodos", alias: "per", columnName: "tp.periodo" },
            ],
        }
    }

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "tps",
            where: service.sqlAnd([
                "materiacurso=@materiacurso",
                "periodo=@periodo",
                "upper(nombre)=upper(@nombre)",
            ]),
            parameters: service.jsonValues("materiacurso,periodo,nombre")
        })
    }

    static DuplicatedMessage() {
        return "Nombre de Trabajo Práctico duplicado";
    }

    static ValidateDesdeHasta(service) {
        this.ValidateDesdeLowerHasta(service);
        return this.ValidateInPeriodo(service);
    }

    static ValidateDesdeLowerHasta(service) {
        if (service.date("hasta") <= service.date("desde")) {
            throw Exceptions.Validation({
                message: "La Fecha de Inicio debe ser menor a la Fecha de Entrega",
                detail: this.DetailDesdeHasta(service)
            })
        }
    }

    static ValidateInPeriodo(service) {
        return this.GetPeriodoData(service)
            .then(row => {
                if (!Dates.Contains(row.desde, row.hasta, service.date("desde"), service.date("hasta"))) {
                    throw Exceptions.Validation({
                        message: "El trabajo práctico debe estar dentro del " + row.nombre,
                        detail: this.DetailDesdeHasta(service) + this.PeriodoDesdeHasta(row)
                    })
                }
            })
    }

    static GetPeriodoData(service) {
        return service.dbSelectOne(service.sqlSelect({
            columns: [
                "per.nombre",
                "per.desde",
                "per.hasta"
            ],
            from: "periodos per",
            where: "id=@id",
            parameters: { id: service.value("periodo") }
        }))
    }

    static DetailDesdeHasta(service) {

        return Messages.Section({
            title: service.value("nombre"),
            lines: ["Fecha de Inicio = " + Dates.Format(service.date("desde")),
                "Fecha de Entrega = " + Dates.Format(service.date("hasta"))
            ]
        })
    }

    static PeriodoDesdeHasta(row) {

        return Messages.Section({
            title: row.nombre,
            lines: [
                "Fecha de Inicio = " + Dates.Format(row.desde),
                "Fecha de Entrega = " + Dates.Format(row.hasta)
            ]
        })

    }

}

module.exports.TpsListService = TpsListService;
module.exports.TpsGetService = TpsGetService;
module.exports.TpsInsertService = TpsInsertService;
module.exports.TpsUpdateService = TpsUpdateService;
module.exports.TpsDeleteService = TpsDeleteService;