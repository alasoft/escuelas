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
                this.valoraciones = rows)
            .then(() =>
                this.dbSelect(this.sqlPeriodos()))
            .then(rows =>
                this.periodos = rows)
            .then(() =>
                this.dbSelect(this.sqlAlumnos()))
            .then(rows =>
                this.alumnos = rows)
            .then(() =>
                this.dbSelect(this.sqlNotas()))
            .then(rows =>
                this.notas = rows)
            .then(() =>
                this.dbSelect(this.sqlTps()))
            .then(rows =>
                this.tps = rows)
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
            rows: {
                valoraciones: this.valoraciones,
                periodos: this.periodos,
                alumnos: this.alumnos,
                notas: this.notas,
                tps: this.tps
            }
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
                "per.hasta"
            ],
            from: "periodos per",
            where: this.sqlAnd().addSql("añolectivo=@añolectivo", {
                añolectivo: this.materiaCurso.añolectivo
            })
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
                "nts.id",
                "nts.alumno",
                "nts.tp",
                "nts.nota",
                "eva.periodo"
            ],
            from: "notas nts",
            joins: [
                { tableName: "evaluaciones", alias: "eva", columnName: "nts.evaluacion" },
            ],
            where: this.sqlAnd().addSql("eva.materiacurso=@materiacurso", {
                materiacurso: this.materiaCurso.id
            })
        })
    }

    sqlTps() {
        return this.sqlSelect({
            columns: [
                "eva.id",
                "eva.nombre",
                "eva.desde",
                "eva.hasta",
                "eva.periodo",
                "per.nombre as periodonombre"
            ],
            from: "evaluaciones eva",
            joins: [
                { tableName: "periodos", alias: "per", columnName: "eva.periodo" }
            ],
            where: this.sqlAnd().addSql("eva.materiacurso=@materiacurso", {
                materiacurso: this.materiaCurso.id
            }),
            order: "per.desde,eva.desde"
        })
    }

}

module.exports.NotasDataListService = NotasDataListService;