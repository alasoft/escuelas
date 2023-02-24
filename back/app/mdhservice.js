const { Utils } = require("../lib/utils/utils");
const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");


class MdhListService extends TableListService {

    sqlParameters() {
        return Utils.Merge(
            MdhCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }


    sqlExtraParameters() {
        return {
            where: this.sqlAnd()
                .add(this.sqlText("mdh.materiacurso=@materiacurso", { materiacurso: this.value("materiacurso") })),
            order: [
                "mdh.dia",
                "mdh.desde"
            ]
        }
    }


}

class MdhGetService extends TableGetService {

    sqlParameters() {
        return Utils.Merge(
            MdhCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: "mdh.id=@id",
            parameters: { id: this.id() }
        }
    }

}

class MdhInsertService extends TableInsertService {

    validate() {
        return super.validate()
            .then(() =>
                MdhCommonService.ValidateDesdeHasta(this))
    }

    requiredValues() {
        return "materiacurso,dia,desde,hasta"
    }

    validateNotDuplicated() {}

}

class MdhUpdateService extends TableUpdateService {

    validate() {
        return super.validate()
            .then(() =>
                MdhCommonService.ValidateDesdeHasta(this))
    }

    validateNotDuplicated() {}

}

class MdhDeleteService extends TableDeleteService {}


class MdhCommonService {

    static SqlBaseParameters(service) {
        return {
            columns: [
                "mdh.id",
                "mdh.materiacurso",
                "mdh.dia",
                "mdh.desde",
                "mdh.hasta",
            ],
            from: "mdh mdh",
        }
    }

    static ValidateDesdeHasta(service) {
        this.ValidateDesdeLowerHasta(service);
        return this.ValidateNoDesdeHastaCollision(service);
    }

    static ValidateDesdeLowerHasta(service) {}

    static ValidateNoDesdeHastaCollision(service) {}


}

module.exports.MdhListService = MdhListService;
module.exports.MdhGetService = MdhGetService;
module.exports.MdhInsertService = MdhInsertService;
module.exports.MdhUpdateService = MdhUpdateService;
module.exports.MdhDeleteService = MdhDeleteService;