const { TableListService, } = require("../lib/service/tableservice");
const { CursosCommonService, } = require("./cursosservice");

class MateriasHorasListAllService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "mh.id",
                "mh.materiacurso",
                "mh.dia",
                "mh.desde",
                "mh.hasta",
                "mat.nombre as materianombre",
                "cur.id as cursoid"
            ].concat(CursosCommonService.ColumnsNoId()),
            from: "materias_dias mh",
            joins: [
                { tableName: "materias_cursos", alias: "mc", columnName: "mh.materiacurso" },
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
                { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
                { tableName: "modalidades", alias: "mdl", columnName: "cur.modalidad" },
                { tableName: "materias", alias: "mat", columnName: "mc.materia" }
            ],
            where: this.sqlAnd()
                .add(this.sqlText("cur.añolectivo=@añolectivo", { añolectivo: this.value("añolectivo") }))
                .addIf(this.isDefined("curso"), () => this.sqlText("cur.id=@curso", { curso: this.value("curso") }))
                .addIf(this.isDefined("materiacurso"), () => this.sqlText("mc.id=@materiacurso", { materiacurso: this.value("materiacurso") })),
            order: [
                "mh.dia",
                "mh.desde"
            ]
        }
    }

}

module.exports.MateriasHorasListAllService = MateriasHorasListAllService;