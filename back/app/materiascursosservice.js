const { TableListService, TableGetService, TableInsertService, TableUpdateService, TableDeleteService } = require("../lib/service/tableservice");

class MateriasCursosListService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "mc.id",
                "mc.curso",
                "mc.materia",
                "mat.nombre as materianombre"
            ],
            from: "materias_cursos mc",
            joins: [
                { tableName: "materias", alias: "mat", columnName: "mc.materia" },
            ],
            where: this.sqlAnd()
                .addIf(this.isDefined("curso"), () =>
                    this.sqlText("mc.curso=@curso", {
                        curso: this.value("curso")
                    }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("mat.nombre ilike @descripcion", {
                        descripcion: this.value("descripcion")
                    })
                ),
            order: "mat.nombre"
        }
    }

}

class MateriasCursosGetService extends TableGetService {

    sqlParameters() {
        return {
            columns: [
                "mc.id",
                "mc.curso",
                "mc.materia"
            ],
            from: "materias_cursos mc",
            where: "id=@id",
            parameters: { id: this.id() }
        }
    }

}

class MateriasCursosInsertService extends TableInsertService {

    requiredValues() {
        return "curso,materia"
    }

    sqlNotDuplicated() {
        return MateriasCursosCommonService.SqlNotDuplicated(this);
    }

    duplicatedMessage() {
        return MateriasCursosCommonService.DuplicatedMessage();
    }

}

class MateriasCursosUpdateService extends TableUpdateService {

    sqlNotDuplicated() {
        return MateriasCursosCommonService.SqlNotDuplicated(this);
    }

    duplicatedMessage() {
        return MateriasCursosCommonService.DuplicatedMessage();
    }

}

class MateriasCursosDeleteService extends TableDeleteService {

}

class MateriasCursosCommonService {

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "materias_cursos",
            where: service.sqlAnd([
                "curso=@curso",
                "materia=@materia",
            ]),
            parameters: service.jsonValues("curso,materia")
        })
    }

    static DuplicatedMessage() {
        return "Materia duplicada";
    }


}

module.exports.MateriasCursosListService = MateriasCursosListService;
module.exports.MateriasCursosGetService = MateriasCursosGetService
module.exports.MateriasCursosInsertService = MateriasCursosInsertService;
module.exports.MateriasCursosUpdateService = MateriasCursosUpdateService;
module.exports.MateriasCursosDeleteService = MateriasCursosDeleteService;