const { Utils } = require("../lib/utils/utils");
const { TableListService, TableGetService, TableInsertService, TableUpdateService, TableDeleteService } = require("../lib/service/tableservice");
const { SqlInsert } = require("../lib/sql/sqloperations");

class CursosListService extends TableListService {

    sqlParameters() {
        return Utils.Merge(CursosCommonService.SqlParametersBase(), this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: this.sqlAnd()
                .addIf(this.isDefined("añolectivo"), () =>
                    this.sqlText("cur.añolectivo=@añolectivo", {
                        añolectivo: this.value("añolectivo")
                    }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("esc.nombre || mod.nombre || cur.año ilike @descripcion", {
                        descripcion: this.sqlLike(this.value("descripcion"))
                    })
                ),
            order: "esc.nombre,mod.nombre,cur.año,cur.division,cur.turno"
        }
    }

}

class CursosGetService extends TableGetService {

    sqlParameters() {
        return Utils.Merge(CursosCommonService.SqlParametersBase(), this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: "cur.id=@id",
            parameters: { id: this.value("id") }
        }
    }

}

class CursosInsertService extends TableInsertService {

    requiredValues() {
        return "añolectivo,escuela,modalidad,año,turno,division";
    }

    sqlNotDuplicated() {
        return CursosCommonService.SqlNotDuplicated(this);
    }

    duplicatedMessage() {
        return CursosCommonService.DuplicatedMessage();
    }

}

class CursosUpdateService extends TableUpdateService {

    sqlNotDuplicated() {
        return CursosCommonService.SqlNotDuplicated(this);
    }

    duplicatedMessage() {
        return CursosCommonService.DuplicatedMessage();
    }

}

class CursosDeleteService extends TableDeleteService {}

class CursosCommonService {

    static SqlParametersBase() {
        return {
            columns: [
                "cur.id",
                "cur.añolectivo",
                "cur.escuela",
                "cur.modalidad",
                "cur.año",
                "cur.division",
                "cur.turno",
                "esc.nombre as escuelaNombre",
                "mod.nombre as modalidadNombre"
            ],
            from: "cursos cur",
            joins: [
                { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
                { tableName: "modalidades", alias: "mod", columnName: "cur.modalidad" },
            ]
        }
    }

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "cursos",
            where: service.sqlAnd([
                "añolectivo=@añolectivo",
                "escuela=@escuela",
                "modalidad=@modalidad",
                "año=@año",
                "upper(division)=upper(@division)",
                "upper(turno)=upper(@turno)"
            ]),
            parameters: service.jsonValues("añolectivo,escuela,modalidad,año,division,turno")
        })
    }

    static DuplicatedMessage() {
        return "Curso duplicado";
    }

}

module.exports.CursosListService = CursosListService;
module.exports.CursosGetService = CursosGetService
module.exports.CursosInsertService = CursosInsertService;
module.exports.CursosUpdateService = CursosUpdateService;
module.exports.CursosDeleteService = CursosDeleteService;