const { Utils } = require("../lib/utils/utils");
const { TableListService, TableGetService, TableInsertService, TableUpdateService, TableDeleteService } = require("../lib/service/tableservice");
const { Años } = require("./años");
const { Turnos } = require("./turnos");

class CursosListService extends TableListService {

    sqlParameters() {
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
            where: this.sqlAnd()
                .addIf(this.isDefined("añoLectivo"), () =>
                    this.sqlText("cur.añolectivo=@añolectivo", {
                        añoLectivo: this.value("añoLectivo")
                    }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("esc.nombre || esc.modalidad ilike @descripcion", {
                        descripcion: this.value("descripcion")
                    })
                ),
            order: "esc.nombre,mod.nombre,cur.año,cur.division,cur.turno"
        }
    }

    transformRow(row) {
        row.añoNombre = Años.GetNombre(row.año);
        row.turnoNombre = Turnos.GetNombre(row.turno);
    }

}

class CursosGetService extends TableGetService {

    sqlParameters() {

        return {
            columns: [
                "cur.id",
                "cur.añolectivo",
                "cur.escuela",
                "cur.modalidad",
                "cur.año",
                "cur.division",
                "cur.turno",
            ],
            from: "cursos cur",
            where: "cur.id=@id",
            parameters: { id: this.value("id") }
        }

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