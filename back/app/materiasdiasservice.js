const { Utils } = require("../lib/utils/utils");
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
        return {
            columns: [
                "md.id",
                "md.materiacurso",
                "md.dia",
                "md.desde",
                "md.hasta",
                "mat.nombre as materianombre",
                "cur.id as curso"
            ],
            from: "materias_dias md",
            joins: [
                { tableName: "materias_cursos", alias: "mc", columnName: "md.materiacurso" },
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
                { tableName: "materias", alias: "mat", columnName: "mc.materia" }
            ],
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

}

class MateriasDiasUpdateService extends TableUpdateService {

    validate() {
        return super.validate()
            .then(() =>
                MateriasDiasCommonService.ValidateDesdeHasta(this))
    }

    validateNotDuplicated() {}

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

}

module.exports.MateriasDiasListService = MateriasDiasListService;
module.exports.MateriasDiasGetService = MateriasDiasGetService;
module.exports.MateriasDiasInsertService = MateriasDiasInsertService;
module.exports.MateriasDiasUpdateService = MateriasDiasUpdateService;
module.exports.MateriasDiasDeleteService = MateriasDiasDeleteService;