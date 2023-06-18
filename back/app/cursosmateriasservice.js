const { ServiceBase } = require("../lib/service/servicebase");

class CursosMateriasService extends ServiceBase {

    execute() {
        this.dbSelect(this.sqlValoraciones())
            .then(rows =>
                this.valoracionesRows = rows)
            .then(() =>
                this.dbSelect(this.sqlPeriodos()))
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
                this.dbSelect(this.sqlExamenesCantidad()))
            .then(count =>
                this.examenesCantidadRows = count)
            .then(() =>
                this.dbSelect(this.sqlNotasCantidad()))
            .then(count =>
                this.notasCantidadRows = count)
            .then(() =>
                this.sendOkey(this.dataToSend()))
            .catch(err =>
                this.sendError(err))
    }

    requiredValues() {
        return "añolectivo";
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
            where: this.sqlAnd().add("añolectivo=@añolectivo"),
            order: "per.desde",
            parameters: { añolectivo: this.value("añolectivo") }
        })
    }

    sqlCursosRows() {
        return this.sqlSelect({
            columns: [
                "cur.id",
                "cur.id as cursoid",
                "cur.añolectivo",
                "cur.escuela",
                "cur.modalidad",
                "cur.año",
                "cur.division",
                "cur.turno",
                "esc.nombre as escuelanombre",
                "mdl.nombre as modalidadnombre",
            ],
            from: "cusos cur",
            joins: [
                { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
                { tableName: "modalidades", alias: "mdl", columnName: "cur.modalidad" },
            ],
            where: "cur.añolectivo=@añolectivo",
            order: "esc.nombre,mdl.nombre,cur.año,cur.division,cur.turno",
            parameters: { añolectivo: this.value("añolectivo") }
        })
    }

    sqlMateriasCursosRows() {
        return this.sqlSelect({
            columns: [
                "mc.id",
                "mc.curso",
                "mc.materia",
                "mat.nombre as materianombre",
            ],
            from: "materias_cursos mc",
            joins: [
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
                { tableName: "materias", alias: "mat", columnName: "mc.materia" }
            ],
            where: "cur.añolectivo=@añolectivo",
            order: "mat.nombre",
            parameters: { añolectivo: this.value("añolectivo") }
        })
    }

    sqlCursosMaterias() {
        return this.sqlSelect({
            columns: [
                //                "cur.id || '_' || coalesce(mc.id,'') as id",
                "cur.id as cursoid",
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

    sqlExamenesCantidad() {
        return this.sqlSelect(
            {
                columns: [
                    "exa.materiacurso",
                    "exa.periodo",
                    "count(*)"
                ],
                from: "examenes exa",
                joins: [
                    { tableName: "materias_cursos", alias: "mc", columnName: "exa.materiacurso" },
                    { tableName: "periodos", alias: "per", columnName: "exa.periodo" }],
                where: this.sqlAnd([
                    "per.añolectivo=@añolectivo",
                    "exa.desde<=now()"
                ]),
                group: [
                    "exa.materiacurso",
                    "exa.periodo"
                ],
                parameters: { añolectivo: this.value("añolectivo") }
            }
        )
    }

    sqlNotasCantidad() {
        return this.sqlSelect(
            {
                columns: [
                    "exa.materiacurso",
                    "exa.periodo",
                    "count(*)",
                    "sum(nt.nota)"
                ],
                from: "notas nt",
                joins: [
                    { tableName: "examenes", alias: "exa", columnName: "nt.examen" },
                    { tableName: "materias_cursos", alias: "mc", columnName: "exa.materiacurso" },
                    { tableName: "periodos", alias: "per", columnName: "exa.periodo" }],
                where: this.sqlAnd([
                    "per.añolectivo=@añolectivo",
                    "exa.desde<=now()"
                ]),
                group: [
                    "exa.materiacurso",
                    "exa.periodo"
                ],
                parameters: { añolectivo: this.value("añolectivo") }
            }
        )
    }

    dataToSend() {
        return {
            valoracionesRows: this.valoracionesRows,
            periodosRows: this.periodosRows,
            cursosMateriasRows: this.cursosMateriasRows,
            alumnosCantidadRows: this.alumnosCantidadRows,
            examenesCantidadRows: this.examenesCantidadRows,
            notasCantidadRows: this.notasCantidadRows
        }
    }

}

module.exports.CursosMateriasService = CursosMateriasService;