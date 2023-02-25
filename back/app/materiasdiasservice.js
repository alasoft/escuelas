const { Utils } = require("../lib/utils/utils");
const { Dates } = require("../lib/utils/dates");
const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");


class MateriasDiasListService extends TableListService {

    sqlParameters() {
        return Utils.Merge(
            MateriasDiasCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }


    sqlExtraParameters() {
        return {
            where: this.sqlAnd()
                .add(this.sqlText("md.materiacurso=@materiacurso", { materiacurso: this.value("materiacurso") })),
            order: [
                "md.dia",
                "md.desde"
            ]
        }
    }


}

class MateriasDiasGetService extends TableGetService {

    sqlParameters() {
        return Utils.Merge(
            MateriasDiasCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: "md.id=@id",
            parameters: { id: this.id() }
        }
    }

}

class MateriasDiasInsertService extends TableInsertService {

    validate() {
        return super.validate()
            .then(() =>
                MateriasDiasCommonService.ValidateDesdeHasta(this))
    }

    requiredValues() {
        return "materiacurso,dia,desde,hasta"
    }

    validateNotDuplicated() {}

    sqlValues() {
        return MateriasDiasCommonService.SqlValues(this)
    }

}

class MateriasDiasUpdateService extends TableUpdateService {

    validate() {
        return super.validate()
            .then(() =>
                MateriasDiasCommonService.ValidateDesdeHasta(this))
    }

    validateNotDuplicated() {}

    sqlValues() {
        return MateriasDiasCommonService.SqlValues(this)
    }

}

class MateriasDiasDeleteService extends TableDeleteService {}


class MateriasDiasCommonService {

    static SqlBaseParameters(service) {
        return {
            columns: [
                "md.id",
                "md.materiacurso",
                "md.dia",
                "md.desde",
                "md.hasta",
            ],
            from: "materias_dias md",
        }
    }

    static ValidateDesdeHasta(service) {
        this.ValidateDesdeLowerHasta(service);
        return this.ValidateNoDesdeHastaCollision(service);
    }

    static ValidateDesdeLowerHasta(service) {}

    static ValidateNoDesdeHastaCollision(service) {}

    static SqlValues(service) {
        return {
            materiacurso: service.value("materiacurso"),
            dia: service.value("dia"),
            desde: Utils.TimeAsString(service.date("desde")),
            hasta: Utils.TimeAsString(service.date("hasta"))
        }
    }


}

module.exports.MateriasDiasListService = MateriasDiasListService;
module.exports.MateriasDiasGetService = MateriasDiasGetService;
module.exports.MateriasDiasInsertService = MateriasDiasInsertService;
module.exports.MateriasDiasUpdateService = MateriasDiasUpdateService;
module.exports.MateriasDiasDeleteService = MateriasDiasDeleteService;