const { TableListService } = require("../lib/service/tableservice");

class CursosMateriasListService extends TableListService {

    sql() {
        return this.sqlSelect({
            column: [
                "cur.id",
                "cur.añolectivo",
                "cur.escuela",
                "cur.modalidad",
                "cur.año",
                "cur.division",
                "cur.turno",
                "esc.nombre as escuelanombre",
                "mdl.nombre as modalidadnombre",
                "mc.id as materiacursoid",
                "mc.materia",
                "mat.nombre as materianombre"
            ],
            from: "cursos cur",
            joins: [
                { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
                { tableName: "modalidades", alias: "mdl", columnName: "cur.modalidad" },
                { tableName: "materias_cursos", alias: "mc", condition: "mc.curso=cur.id" },
                { tableName: "materias", alias: "mat", columnName: "mc.materia" }
            ],
            where: this.sqlAnd()
                .add("cur.añolectivo=@añolectivo"),
            order: "esc.nombre,mdl.nombre,cur.año,cur.division,cur.turno,mat.nombre",
            parameters: { añolectivo: this.value("añolectivo") }
        })
    }

}

module.exports.CursosMateriasListService = CursosMateriasListService;