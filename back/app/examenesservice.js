const { Exceptions } = require("../lib/utils/exceptions");
const { Utils, Dates } = require("../lib/utils/utils");
const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");

class ExamenesListService extends TableListService {

    sqlParameters() {
        return Utils.Merge(
            ExamenesCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: this.sqlAnd()
                .addIf(this.isDefined("materiacurso"), () => this.sqlText("exa.materiacurso=@materiacurso", { materiacurso: this.value("materiacurso") }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("exa.nombre ilike @nombre", { nombre: this.sqlLike(this.value("descripcion")) })),
            order: [
                "per.desde",
                "exa.desde",
                "exa.nombre"
            ]
        }
    }

}

class ExamenesGetService extends TableGetService {

    sqlParameters() {
        return Utils.Merge(
            ExamenesCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: "exa.id=@id",
            parameters: { id: this.id() }
        }
    }

}

class ExamenesInsertService extends TableInsertService {

    validate() {
        return super.validate()
            .then(() =>
                ExamenesCommonService.ValidateDesdeHasta(this))
    }

    requiredValues() {
        return "materiacurso,periodo,nombre,desde,hasta"
    }

    sqlNotDuplicated() {
        return ExamenesCommonService.SqlNotDuplicated(this);
    }

}

class ExamenesUpdateService extends TableUpdateService {

    validate() {
        return super.validate()
            .then(() =>
                ExamenesCommonService.ValidateDesdeHasta(this))
    }

    sqlNotDuplicated() {
        return ExamenesCommonService.SqlNotDuplicated(this);
    }

}

class ExamenesDeleteService extends TableDeleteService {}


class ExamenesCommonService {

    static SqlBaseParameters(service) {
        return {
            columns: [
                "exa.id",
                "exa.materiacurso",
                "exa.periodo",
                "exa.nombre",
                "exa.tipo",
                "exa.desde",
                "exa.hasta",
                "cur.id as curso",
                "per.nombre as periodonombre",
                "per.desde as periododesde",
                "per.hasta as periodohasta"
            ],
            from: "examenes exa",
            joins: [
                { tableName: "materias_cursos", alias: "mc", columnName: "exa.materiacurso" },
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
                { tableName: "periodos", alias: "per", columnName: "exa.periodo" },
            ],
        }
    }

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "examenes",
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
        if (service.date("hasta") < service.date("desde")) {
            throw Exceptions.Validation({
                code: Exceptions.FECHA_ENTREGA_DEBER_SER_MAYOR_IGUAL_INICIO,
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

module.exports.ExamenesListService = ExamenesListService;
module.exports.ExamenesGetService = ExamenesGetService;
module.exports.ExamenesInsertService = ExamenesInsertService;
module.exports.ExamenesUpdateService = ExamenesUpdateService;
module.exports.ExamenesDeleteService = ExamenesDeleteService;