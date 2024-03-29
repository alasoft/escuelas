const { Utils } = require("../lib/utils/utils");
const { TableListService, TableGetService, TableInsertService, TableUpdateService, TableDeleteService } = require("../lib/service/tableservice");
const { ServiceBase } = require("../lib/service/servicebase");

class CursosServiceBase extends ServiceBase {

    static columns() {
        return [
            "cur.añolectivo",
            "cur.escuela",
            "cur.modalidad",
            "cur.año",
            "cur.division",
            "cur.turno",
            "esc.nombre as escuelanombre",
            "mdl.nombre as modalidadnombre"
        ]
    }

    static joins() {
        return [
            { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
            { tableName: "modalidades", alias: "mdl", columnName: "cur.modalidad" },
        ]
    }

}

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
                    this.sqlText("esc.nombre || mdl.nombre || cur.año ilike @descripcion", {
                        descripcion: this.sqlLike(this.value("descripcion"))
                    })
                ),
            order: "esc.nombre,mdl.nombre,cur.año,cur.division,cur.turno"
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

}

class CursosUpdateService extends TableUpdateService {

    sqlNotDuplicated() {
        return CursosCommonService.SqlNotDuplicated(this);
    }

}

class CursosDeleteService extends TableDeleteService {}

class CursosCommonService {

    static ColumnsNoId() {
        return [
            "cur.añolectivo",
            "cur.escuela",
            "cur.modalidad",
            "cur.año",
            "cur.division",
            "cur.turno",
            "esc.nombre as escuelanombre",
            "mdl.nombre as modalidadnombre"
        ]
    }

    static SqlParametersBase() {
        return {
            columns: [
                "cur.id"
            ].concat(this.ColumnsNoId()),
            from: "cursos cur",
            joins: [
                { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
                { tableName: "modalidades", alias: "mdl", columnName: "cur.modalidad" },
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

}

module.exports.CursosServiceBase = CursosServiceBase;
module.exports.CursosListService = CursosListService;
module.exports.CursosGetService = CursosGetService
module.exports.CursosInsertService = CursosInsertService;
module.exports.CursosUpdateService = CursosUpdateService;
module.exports.CursosDeleteService = CursosDeleteService;
module.exports.CursosCommonService = CursosCommonService;