const { Exceptions } = require("../lib/utils/exceptions");
const { Utils, Dates } = require("../lib/utils/utils");
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
                .addIf(this.isDefined("materiacurso"), () => this.sqlText("tp.materiacurso=@materiacurso", { materiacurso: this.value("materiacurso") }))
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
                "cur.id as curso",
                "per.nombre as periodonombre",
                "per.desde as periododesde",
                "per.hasta as periodohasta"
            ],
            from: "tps tp",
            joins: [
                { tableName: "materias_cursos", alias: "mc", columnName: "tp.materiacurso" },
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
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

    static ValidateDesdeHasta(service) {
        this.ValidateDesdeLowerHasta(service);
        return this.ValidateInPeriodo(service);
    }

    static ValidateDesdeLowerHasta(service) {
        if (service.date("hasta") <= service.date("desde")) {
            throw Exceptions.Validation({
                code: Exceptions.FECHA_INICIO_DEBE_SER_MENOR_FECHA_ENTREGA,
            })
        }
    }

    static ValidateInPeriodo(service) {
        return this.GetPeriodoData(service)
            .then(row => {
                if (!Dates.Contains(row.desde, row.hasta, service.date("desde"), service.date("hasta"))) {
                    throw Exceptions.Validation({
                        code: Exceptions.DEBE_ESTAR_DENTRO_PERIODO,
                        detail: row
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

}

module.exports.TpsListService = TpsListService;
module.exports.TpsGetService = TpsGetService;
module.exports.TpsInsertService = TpsInsertService;
module.exports.TpsUpdateService = TpsUpdateService;
module.exports.TpsDeleteService = TpsDeleteService;