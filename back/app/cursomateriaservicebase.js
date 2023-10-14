const { ServiceBase } = require("../lib/service/servicebase");
const { Exceptions } = require("../lib/utils/exceptions");

class CursoMateriaServiceBase extends ServiceBase {

    execute() {
        return this.validate()
            .then(() =>
                this.dbSelectOne(this.sqlCurso()))
            .then(row =>
                this.cursoRow = row)
            .then(() =>
                this.dbSelect(this.sqlPeriodos()))
            .then(rows =>
                this.periodosRows = rows)
    }

    requiredValues() {
        return "curso";
    }

    sqlCurso() {
        return this.sqlSelect({
            columns: [
                "cur.id",
                "cur.añolectivo"
            ],
            from: "cursos cur",
            where: "cur.id=@id",
            parameters: { id: this.value("curso") }
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
                añolectivo: this.cursoRow.añolectivo
            }),
            order: "per.desde"
        })
    }

}

module.exports.CursoMateriaServiceBase = CursoMateriaServiceBase;