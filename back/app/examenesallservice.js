const { TableListService } = require("../lib/service/tableservice");
const { CursosCommonService } = require("./cursosservice");

class ExamenesListAllService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "exa.id",
                "exa.materiacurso",
                "exa.periodo",
                "exa.nombre",
                "exa.desde",
                "exa.hasta",
                "mat.nombre as materianombre",
                "per.nombre as periodonombre",
                "per.desde as periododesde",
                "per.hasta as periodohasta",
                "cur.id as curso"
            ].concat(CursosCommonService.ColumnsNoId()),
            from: "examenes exa",
            joins: [
                { tableName: "materias_cursos", alias: "mc", columnName: "exa.materiacurso" },
                { tableName: "materias", alias: "mat", columnName: "mc.materia" },
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
                { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
                { tableName: "modalidades", alias: "mdl", columnName: "cur.modalidad" },
                { tableName: "periodos", alias: "per", columnName: "exa.periodo" }
            ],
            where: this.sqlAnd()
                .add(this.sqlText("cur.añolectivo=@añolectivo", { añolectivo: this.value("añolectivo") }))
                .addIf(this.isDefined("curso"), () => this.sqlText("cur.id=@curso", { curso: this.value("curso") }))
                .addIf(this.isDefined("materiacurso"), () => this.sqlText("mc.id=@materiacurso", { materiacurso: this.value("materiacurso") })),
            order: "exa.desde"
        }
    }

}

module.exports.ExamenesListAllService = ExamenesListAllService;