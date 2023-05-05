const { ServiceBase } = require("../lib/service/servicebase");
const { Exceptions } = require("../lib/utils/exceptions");

class NotasDataListService extends ServiceBase {

    execute() {
        this.validate()
            .then(() =>
                this.dbSelectOne(this.sqlMateriaCurso()))
            .then(row => {
                if (row != undefined) {
                    this.materiaCurso = row
                } else {
                    throw Exceptions.Validation({
                        code: Exceptions.MATERIA_CURSO_NOT_FOUND
                    })
                }
            })
            .then(() =>
                this.dbSelect(this.sqlValoraciones()))
            .then(rows =>
                this.valoracionesRows = rows)
            .then(() =>
                this.dbSelect(this.sqlPeriodos()))
            .then(rows =>
                this.periodosRows = rows)
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

    requiredValues() {
        return "materiacurso";
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

    sqlMateriaCurso() {
        return this.sqlSelect({
            columns: [
                "mcr.id",
                "mcr.curso",
                "cur.añolectivo"
            ],
            from: "materias_cursos mcr",
            joins: [
                { tableName: "cursos", alias: "cur", columnName: "mcr.curso" },
            ],
            where: this.sqlAnd().addSql("mcr.id=@id", { id: this.value("materiacurso") })
        })
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
                añolectivo: this.materiaCurso.añolectivo
            }),
            order: "per.desde"
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
            where: this.sqlAnd().addSql("alu.curso=@curso", {
                curso: this.materiaCurso.curso
            }),
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
            where: this.sqlAnd().addSql("exa.materiacurso=@materiacurso", {
                materiacurso: this.materiaCurso.id
            })
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
                materiacurso: this.materiaCurso.id
            }),
            order: "per.desde,exa.desde"
        })
    }

}

module.exports.NotasDataListService = NotasDataListService;