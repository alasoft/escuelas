const { ServiceBase } = require("../lib/service/servicebase");
const { Exceptions } = require("../lib/utils/exceptions");
const { CursoMateriaServiceBase } = require("./cursomateriaservicebase");

class NotasDataListService extends CursoMateriaServiceBase {

    execute() {
        super.execute()
            .then(() =>
                this.dbSelect(this.sqlValoraciones()))
            .then(rows =>
                this.valoracionesRows = rows)
            .then(() =>
                this.dbSelect(this.sqlAlumnos()))
            .then(rows =>
                this.alumnosRows = rows)
            .then(() =>
                this.dbSelect(this.sqlNotas()))
            .then(rows =>
                this.notasRows = rows)
            .then(() =>
                this.dbSelect(this.sqlExamenes()))
            .then(rows =>
                this.examenesRows = rows)
            .then(() =>
                this.sendOkey(this.dataToSend()))
            .catch(err =>
                this.sendError(err))

    }

    dataToSend() {
        return {
            valoracionesRows: this.valoracionesRows,
            periodosRows: this.periodosRows,
            alumnosRows: this.alumnosRows,
            notasRows: this.notasRows,
            examenesRows: this.examenesRows
        }
    }

    sqlValoraciones() {
        return this.sqlSelect({
            columns: [
                "vlr.id",
                "vlr.nombre",
                "vlr.desde",
                "vlr.hasta",
                "vlr.sigla"
            ],
            from: "valoraciones vlr"
        })
    }

    sqlAlumnos() {
        return this.sqlSelect({
            columns: [
                "alu.id",
                "alu.apellido",
                "alu.nombre"
            ],
            from: "alumnos alu",
            where: "alu.curso=@curso",
            parameters: { curso: this.value("curso") },
            order: "alu.apellido,alu.nombre"
        })
    }

    sqlNotas() {
        return this.sqlSelect({
            columns: [
                "nt.id",
                "nt.alumno",
                "nt.examen",
                "nt.nota",
                "nt._created",
                "nt._updated",
                "exa.periodo"
            ],
            from: "notas nt",
            joins: [
                { tableName: "examenes", alias: "exa", columnName: "nt.examen" },
            ],
            where: "exa.materiacurso=@materiacurso",
            parameters: { materiacurso: this.value("materiacurso") }
        })
    }

    sqlExamenes() {
        return this.sqlSelect({
            columns: [
                "exa.id",
                "exa.tipo",
                "exa.nombre",
                "exa.desde",
                "exa.hasta",
                "exa.periodo",
                "per.nombre as periodonombre"
            ],
            from: "examenes exa",
            joins: [
                { tableName: "periodos", alias: "per", columnName: "exa.periodo" }
            ],
            where: this.sqlAnd().addSql("exa.materiacurso=@materiacurso", {
                materiacurso: this.value("materiacurso")
            }),
            order: "per.desde,exa.desde"
        })
    }

}

module.exports.NotasDataListService = NotasDataListService;