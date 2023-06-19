const { ServiceBase } = require("../lib/service/servicebase");

class AsistenciaMateriasCursosService extends ServiceBase {

    execute() {
        this.dbSelect(this.sqlPeriodos())
            .then(rows =>
                this.periodosRows = rows)
            .then(() =>
                this.dbSelect(this.sqlCursosMaterias()))
            .then(rows =>
                this.cursosMateriasRows = rows)
            .then(() =>
                this.dbSelect(this.sqlAlumnosCantidad()))
            .then(count =>
                this.alumnosCantidadRows = count)
            .then(() =>
                this.dbSelect(this.sqlAsistenciasCantidad()))
            .then(count =>
                this.asistenciasCantidadRows = count)
            .then(() =>
                this.dbSelect(this.sqlAsistenciasAlumnosCantidad()))
            .then(count =>
                this.asistenciasAlumnosCantidadRows = count)
            .then(() =>
                this.sendOkey(this.dataToSend()))
            .catch(err =>
                this.sendError(err))
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
            where: this.sqlAnd().add("añolectivo=@añolectivo"),
            order: "per.desde",
            parameters: { añolectivo: this.value("añolectivo") }
        })
    }

    sqlCursosMaterias() {
        return this.sqlSelect({
            columns: [
                "cur.id as curso",
                "cur.añolectivo",
                "cur.escuela",
                "cur.modalidad",
                "cur.año",
                "cur.division",
                "cur.turno",
                "esc.nombre as escuelanombre",
                "mdl.nombre as modalidadnombre",
                "mc.id as materiacurso",
                "mc.materia",
                "mat.nombre as materianombre"
            ],
            from: "cursos cur",
            joins: [
                { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
                { tableName: "modalidades", alias: "mdl", columnName: "cur.modalidad" },
                { tableName: "materias_cursos", alias: "mc", condition: "mc.curso=cur.id" },
                { tableName: "materias", alias: "mat", columnName: "mc.materia" }
            ],
            where: this.sqlAnd()
                .add("cur.añolectivo=@añolectivo"),
            order: "esc.nombre,mdl.nombre,cur.año,cur.division,cur.turno,mat.nombre",
            parameters: { añolectivo: this.value("añolectivo") }
        })
    }

    sqlAlumnosCantidad() {
        return this.sqlSelect({
            columns: [
                "al.curso",
                "count(*)"
            ],
            from: "alumnos al",
            joins: [
                { tableName: "cursos", alias: "cur", columnName: "al.curso", }],
            where: this.sqlAnd([
                "cur.añolectivo=@añolectivo"
            ]),
            group: [
                "al.curso"
            ],
            parameters: { añolectivo: this.value("añolectivo") }
        })
    }

    sqlAsistenciasCantidad() {
        return this.sqlSelect(
            {
                columns: [
                    "mh.materiacurso",
                    "af.periodo",
                    "count(*)"
                ],
                from: "asistencias_fechas af",
                joins: [
                    { tableName: "materias_horas", alias: "mh", columnName: "af.horario" },
                    { tableName: "periodos", alias: "per", columnName: "af.periodo" }],
                where: this.sqlAnd([
                    "af.fecha<=now()",
                    "af.estado>0",
                    "per.añolectivo=@añolectivo"
                ]),
                group: [
                    "mh.materiacurso",
                    "af.periodo"
                ],
                parameters: { añolectivo: this.value("añolectivo") }
            }
        )
    }

    sqlAsistenciasAlumnosCantidad() {
        return this.sqlSelect(
            {
                columns: [
                    "mh.materiacurso",
                    "ad.periodo",
                    "count(*)"
                ],
                from: "asistencias_alumnos aa",
                joins: [
                    { tableName: "asistencias_fechas", alias: "af", columnName: "aa.dia" },
                    { tableName: "materias_horas", alias: "mh", columnName: "af.horario" },
                    { tableName: "periodos", alias: "per", columnName: "af.periodo" }],
                where: this.sqlAnd([
                    "af.fecha<=now()",
                    "af.estado>0",
                    "per.añolectivo=@añolectivo",
                    "aa.asistio="
                ]),
                group: [
                    "mh.materiacurso",
                    "af.periodo"
                ],
                parameters: { añolectivo: this.value("añolectivo") }
            }
        )
    }

    dataToSend() {
        return {
            periodosRows: this.periodosRows,
            cursosMateriasRows: this.cursosMateriasRows,
            alumnosCantidadRows: this.alumnosCantidadRows,
            asistenciasDiasCantidadRows: this.asistenciasDiasCantidadRows,
            asistenciasDiasCantidadRows: this.asistenciasDiasCantidadRows,
        }
    }

}

module.exports.AsistenciaMateriasCursosService = AsistenciaMateriasCursosService;