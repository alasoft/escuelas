const { ServiceBase } = require("../lib/service/servicebase");
const { Sql } = require("../lib/sql/sql");

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
                this.loadPeriodos())
            .then(() =>
                this.loadTps())
            .then(() =>
                this.loadEvaluaciones()
            )
    }

    data() {
        return {
            tpColumns: this.tpColumns(),
            rows: this.rows()
        }
    }

    tpColumns() {
        const columns = []
        for (const periodo of this.periodos()) {
            columns.push({
                caption: periodo.nombre,
                alignment: "center",
                columns: this.periodoTpColumns(periodo.id)
            })
        }
        return columns;
    }

    periodoTpColumns(periodo) {
        const columns = [];
        for (const tp of this.tps()) {
            if (tp.periodo == periodo) {
                columns.push({
                    dataField: tp.id,
                    caption: tp.nombre,
                    alignment: "left",
                    dataType: "number",
                    allowResizing: false,
                    allowReordering: false,
                    allowSorting: false,
                    width: 120
                })

            }
        }
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
                evaluacion.alumno == row.id);
        for (const evaluacion of evaluaciones) {
            row[evaluacion.tp] = evaluacion.nota;
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
                "tp.hasta",
            ],
            from: "tps tp",
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
                "eva.nota",
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

    periodos() {
        return this._periodos;
    }

    loadPeriodos() {
        return this.dbSelect(this.sqlPeriodos())
            .then(rows =>
                this._periodos = rows)
    }

    sqlPeriodos() {
        return this.sqlSelect({
            columns: [
                "per.id",
                "per.nombre"
            ],
            distinct: true,
            from: "tps tp",
            joins: [
                { tableName: "periodos", alias: "per", columnName: "tp.periodo" }
            ],
            where: "tp.materiacurso=@materiacurso",
            parameters: { materiacurso: this.value("materiacurso") }
        })
    }

}

class EvaluacionesUpdateService extends ServiceBase {

    execute() {
        this.validate()
            .then(() =>
                this.saveEvaluacion())
            .then(() =>
                this.sendOkey(this.values()))
            .catch(err =>
                this.sendError(err))
    }

    requiredValues() {
        return "alumno,tp"
    }

    saveEvaluacion() {
        return this.defineSql()
            .then(sql =>
                this.dbExecute(sql))
    }

    defineSql() {
        return this.dbExists(this.sqlExistsEvaluacion())
            .then(exists => {
                if (this.isDefined("nota")) {
                    if (exists) {
                        return this.sqlUpdateEvaluacion()
                    } else {
                        return this.sqlInsertEvaluacion()
                    }
                } else {
                    if (exists) {
                        return this.sqlDeleteEvaluacion()
                    }
                }
            })
    }

    sqlExistsEvaluacion() {
        return this.sqlSelect({
            columns: [
                "id"
            ],
            from: "evaluaciones",
            where: this.sqlAnd()
                .add("alumno=@alumno")
                .add("tp=@tp"),
            parameters: this.jsonValues("alumno,tp")
        })
    }

    sqlInsertEvaluacion() {
        return this.sqlInsert({
            tableName: "evaluaciones",
            values: this.jsonValues("alumno,tp,nota")
        })
    }

    sqlUpdateEvaluacion() {
        return this.sqlUpdate({
            tableName: "evaluaciones",
            values: this.jsonValues("id,nota"),
        })
    }

    sqlDeleteEvaluacion() {
        return this.sqlDelete({
            tableName: "evaluaciones",
            values: this.jsonValues("id")
        })
    }

}

module.exports.EvaluacionesListService = EvaluacionesListService;
module.exports.EvaluacionesUpdateService = EvaluacionesUpdateService;