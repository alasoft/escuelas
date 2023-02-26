const { TableListService, } = require("../lib/service/tableservice");

const { CursosCommonService, } = require("./cursosservice");

class MateriasDiasListAllService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "md.id",
                "md.materiacurso",
                "md.dia",
                "md.desde",
                "md.hasta",
                "mat.nombre as materianombre",
                "cur.id as cursoid"
            ].concat(CursosCommonService.ColumnsNoId()),
            from: "materias_dias md",
            joins: [
                { tableName: "materias_cursos", alias: "mc", columnName: "md.materiacurso" },
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
                "md.dia",
                "md.desde"
            ]
        }
    }

}

module.exports.MateriasDiasListAllService = MateriasDiasListAllService;