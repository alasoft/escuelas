const { ServiceBase } = require("../lib/service/servicebase");

class EvaluacionesListService extends ServiceBase {

    execute() {
        this.validate()
            .then(() =>
                this.loadData())
            .then(() =>
                this.sendOkey(this.data())
            )
    }

    requiredValues() {
        return "materiacurso";
    }

    loadData() {
        return this.loadMateriaCurso()
            .then(() =>
                this.loadAlumnos())
            .then(() =>
                this.loadTps())
            .then(() =>
                this.loadEvaluaciones()
            )
    }

    data() {
        return {
            columns: this.columns(),
            rows: this.rows()
        }
    }

    columns() {
        const columns = [];
        for (const tp of this.tps()) {
            columns.push({
                dataField: tp.id,
                caption: tp.nombre,
                width: 150
            })
        }
        columns.push({})
        return columns;
    }

    rows() {
        const rows = [];
        for (const alumno of this.alumnos()) {
            const row = {
                id: alumno.id,
                apellido: alumno.apellido,
                nombre: alumno.nombre
            };
            rows.push(this.rowAddEvaluaciones(row))
        }
        return rows;
    }

    rowAddEvaluaciones(row) {
        const evaluaciones = this.evaluaciones()
            .filter(evaluacion =>
                evaluacion.alumno == row.alumno);
        for (const evaluacion of evaluaciones) {
            row[evaluacion.tp] = evaluacion.evaluacion;
        }
        return row;
    }

    tps() {
        return this._tps;
    }

    loadTps() {
        return this.dbSelect(this.sqlTps())
            .then(rows =>
                this._tps = rows)
    }

    sqlTps() {
        return this.sqlSelect({
            columns: [
                "tp.id",
                "tp.nombre",
                "tp.periodo",
                "tp.desde",
                "tp.hasta"
            ],
            from: "tps tp",
            joins: [
                { tableName: "periodos", alias: "per", columnName: "tp.periodo" }
            ],
            where: "tp.materiacurso=@materiacurso",
            parameters: { materiacurso: this.value("materiacurso") }
        })
    }

    materiaCurso() {
        return this._materiacurso;
    }

    loadMateriaCurso() {
        return this.dbSelectOne(this.sqlMateriaCurso())
            .then(row =>
                this._materiacurso = row
            )
    }

    sqlMateriaCurso() {
        return this.sqlSelect({
            columns: [
                "mc.id",
                "mc.curso"
            ],
            from: "materias_cursos mc",
            where: "mc.id=@id",
            parameters: { id: this.value("materiacurso") }
        })
    }

    alumnos() {
        return this._alumnos;
    }

    loadAlumnos() {
        return this.dbSelect(this.sqlAlumnos())
            .then(rows =>
                this._alumnos = rows)
    }

    sqlAlumnos() {
        return this.sqlSelect({
            columns: [
                "alu.id",
                "alu.apellido",
                "alu.nombre",
                "alu.genero"
            ],
            from: "alumnos alu",
            where: "alu.curso=@curso",
            parameters: { curso: this.materiaCurso().curso }
        })
    }

    evaluaciones() {
        return this._evaluaciones;
    }

    loadEvaluaciones() {
        return this.dbSelect(this.sqlEvaluaciones())
            .then(rows =>
                this._evaluaciones = rows)
    }

    sqlEvaluaciones() {
        return this.sqlSelect({
            columns: [
                "eva.id",
                "eva.alumno",
                "eva.tp",
                "eva.evaluacion",
                "tp.nombre as tpnombre",
            ],
            from: "evaluaciones eva",
            joins: [
                { tableName: "tps", alias: "tp", columnName: "eva.tp" },
            ],
            where: "tp.materiacurso=@materiacurso",
            parameters: { materiacurso: this.value("materiacurso") }
        })
    }

}

module.exports.EvaluacionesListService = EvaluacionesListService;