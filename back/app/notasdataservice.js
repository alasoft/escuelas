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
                "tps.periodo"
            ],
            from: "notas nts",
            joins: [
                { tableName: "tps", alias: "tps", columnName: "nts.tp" },
            ],
            where: this.sqlAnd().addSql("tps.materiacurso=@materiacurso", {
                materiacurso: this.materiaCurso.id
            })
        })
    }

    sqlTps() {
        return this.sqlSelect({
            columns: [
                "tps.id",
                "tps.nombre",
                "tps.desde",
                "tps.hasta",
                "tps.periodo",
                "per.nombre as periodonombre"
            ],
            from: "tps tps",
            joins: [
                { tableName: "periodos", alias: "per", columnName: "tps.periodo" }
            ],
            where: this.sqlAnd().addSql("tps.materiacurso=@materiacurso", {
                materiacurso: this.materiaCurso.id
            }),
            order: "per.desde,tps.desde"
        })
    }

}

module.exports.NotasDataListService = NotasDataListService;