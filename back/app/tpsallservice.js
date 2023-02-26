const { TableListService } = require("../lib/service/tableservice");
const { CursosCommonService } = require("./cursosservice");

class TpsListAllService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "tp.id",
                "tp.materiacurso",
                "tp.periodo",
                "tp.nombre",
                "tp.desde",
                "tp.hasta",
                "mat.nombre as materianombre",
                "per.nombre as periodonombre",
                "per.desde as periododesde",
                "per.hasta as periodohasta",
                "cur.id as curso"
            ].concat(CursosCommonService.ColumnsNoId()),
            from: "tps tp",
            joins: [
                { tableName: "materias_cursos", alias: "mc", columnName: "tp.materiacurso" },
                { tableName: "materias", alias: "mat", columnName: "mc.materia" },
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
                { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
                { tableName: "modalidades", alias: "mdl", columnName: "cur.modalidad" },
                { tableName: "periodos", alias: "per", columnName: "tp.periodo" }
            ],
            where: this.sqlAnd()
                .add(this.sqlText("cur.añolectivo=@añolectivo", { añolectivo: this.value("añolectivo") }))
                .addIf(this.isDefined("curso"), () => this.sqlText("cur.id=@curso", { curso: this.value("curso") }))
                .addIf(this.isDefined("materiacurso"), () => this.sqlText("mc.id=@materiacurso", { materiacurso: this.value("materiacurso") })),
            order: "tp.desde"
        }
    }

}

module.exports.TpsListAllService = TpsListAllService;