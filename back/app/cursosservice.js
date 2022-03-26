const { Utils } = require("../lib/utils/utils");
const { TableListService, TableGetService, TableInsertService, TableUpdateService, TableDeleteService } = require("../lib/service/tableservice");

class CursosListService extends TableListService {

    sqlParameters() {
        return Utils.Merge(CursosCommonService.SqlBaseParameters(),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: this.sqlAnd()
                .addIf(this.isDefined("añoLectivo"), () =>
                    this.sqlText("cur.añolectivo=@añolectivo", {
                        añoLectivo: this.value("añoLectivo")
                    }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("esc.nombre || esc.modalidad ilike @descripcion", {
                        descripcion: this.value("descripcion")
                    })
                )
        }
    }

    transformRow(row) {
        return CursosCommonService.TransformRow(row);
    }

}

class CursosGetService extends TableGetService {

    sqlParameters() {
        return Utils.Merge(CursosCommonService.SqlBaseParameters(),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: "cur.id=@id",
            parameters: { id: this.value("id") }
        }
    }

    TransformRow(row) {
        return CursosCommonService.TransformRow(row);
    }

}

class CursosInsertService extends TableInsertService {

    requiredValues() {
        return "añoLectivo,escuela,modalidad,año,turno,division";

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

    static SqlBaseParameters() {
        return {
            columns: [
                "cur.id",
                "cur.añolectivo",
                "cur.escuela",
                "cur.modalidad",
                "cur.año",
                "cur.division",
                "cur.turno",
                "esc.nombre as escuelanombre",
                "mod.nombre as modalidadnombre"
            ],
            from: "cursos cur",
            joins: [
                { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
                { tableName: "modalidades", alias: "mod", columnName: "cur.modalidad" },
            ],
            order: "esc.nombre,mod.nombre,cur.año,cur.division,cur.turno"
        }
    }

    static TransformRow(row) {
        row.añoNombre = Años.getNombre(row.año);
        row.turnoNombre = Turnos.getNombre(row.turno);
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
        return "curso duplicado";
    }

}

module.exports.CursosListService = CursosListService;
module.exports.CursosGetService = CursosGetService
module.exports.CursosInsertService = CursosInsertService;
module.exports.CursosUpdateService = CursosUpdateService;
module.exports.CursosDeleteService = CursosDeleteService;