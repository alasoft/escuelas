const { Utils } = require("../lib/utils/utils");
const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");

class MateriasHorasListService extends TableListService {

    sqlParameters() {
        return Utils.Merge(
            MateriasHorasCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: this.sqlAnd()
                .add(this.sqlText("mh.materiacurso=@materiacurso", { materiacurso: this.value("materiacurso") })),
            order: [
                "mh.dia",
                "mh.desde"
            ]
        }
    }

}

class MateriasHorasGetService extends TableGetService {

    sqlParameters() {
        return {
            columns: [
                "mh.id",
                "mh.materiacurso",
                "mh.dia",
                "mh.desde",
                "mh.hasta",
                "mat.nombre as materianombre",
                "cur.id as curso"
            ],
            from: "materias_horas mh",
            joins: [
                { tableName: "materias_cursos", alias: "mc", columnName: "mh.materiacurso" },
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
                { tableName: "materias", alias: "mat", columnName: "mc.materia" }
            ],
            where: "mh.id=@id",
            parameters: { id: this.id() }
        }
    }

}

class MateriasHorasInsertService extends TableInsertService {

    validate() {
        return super.validate()
            .then(() =>
                MateriasHorasCommonService.ValidateDesdeHasta(this))
    }

    requiredValues() {
        return "materiacurso,dia,desde,hasta"
    }

    validateNotDuplicated() {}

}

class MateriasHorasUpdateService extends TableUpdateService {

    validate() {
        return super.validate()
            .then(() =>
                MateriasHorasCommonService.ValidateDesdeHasta(this))
    }

    validateNotDuplicated() {}

}

class MateriasHorasDeleteService extends TableDeleteService {}


class MateriasHorasCommonService {

    static SqlBaseParameters(service) {
        return {
            columns: [
                "mh.id",
                "mh.materiacurso",
                "mh.dia",
                "mh.desde",
                "mh.hasta",
            ],
            from: "materias_horas mh",
        }
    }

    static ValidateDesdeHasta(service) {
        this.ValidateDesdeLowerHasta(service);
        return this.ValidateNoDesdeHastaCollision(service);
    }

    static ValidateDesdeLowerHasta(service) {}

    static ValidateNoDesdeHastaCollision(service) {}

}

module.exports.MateriasHorasListService = MateriasHorasListService;
module.exports.MateriasHorasGetService = MateriasHorasGetService;
module.exports.MateriasHorasInsertService = MateriasHorasInsertService;
module.exports.MateriasHorasUpdateService = MateriasHorasUpdateService;
module.exports.MateriasHorasDeleteService = MateriasHorasDeleteService;