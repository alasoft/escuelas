const { ServiceBase } = require("../lib/service/servicebase");
const { Exceptions } = require("../lib/utils/exceptions");

class CursoMateriaServiceBase extends ServiceBase {

    get materiaCurso() {
        return this.value("materiacurso");
    }

    execute() {
        return this.validate()
            .then(() =>
                this.dbSelectOne(this.sqlMateriaCurso()))
            .then(row =>
                this.materiaCursoRow = row)
            .then(() =>
                this.dbSelect(this.sqlPeriodos()))
            .then(rows =>
                this.periodosRows = rows)
    }

    requiredValues() {
        return "materiacurso";
    }

    sqlMateriaCurso() {
        return this.sqlSelect({
            columns: [
                "mc.id",
                "mc.curso",
                "cur.añolectivo"
            ],
            from: "materias_cursos mc",
            joins: [
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
            ],
            where: "mc.id=@id",
            parameters: { id: this.materiaCurso }
        })
    }

    sqlPeriodos() {
        return this.sqlSelect({
            columns: [
                "per.id",
                "per.nombre",
                "per.desde",
                "per.hasta",
                "per.preliminar"
            ],
            from: "periodos per",
            where: this.sqlAnd().addSql("añolectivo=@añolectivo", {
                añolectivo: this.materiaCursoRow.añolectivo
            }),
            order: "per.desde"
        })
    }

}

module.exports.CursoMateriaServiceBase = CursoMateriaServiceBase;