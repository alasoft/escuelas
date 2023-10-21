const { CursoMateriaServiceBase } = require("./cursomateriaservicebase");

class AsistenciasService extends CursoMateriaServiceBase {

    execute() {
        super.execute()
            .then(() =>
                this.dbSelect(this.sqlAsistenciasFechas()))
            .then(rows =>
                this.asistenciasFechasRows = rows)
            .catch(err =>
                this.sendError(err))
    }

    sqlAsistenciasFechas() {
        return this.sqlSelect({
            columnns: [
                "af.id",
                "af.materiahora",
                "af.periodo",
                "af.fecha",
                "af.estado"
            ],
            from: "asistencias_fechas af",
            joins: [{
                tableName: "materias_horas", alias: "mh", columnName: "af.materiahora",
            }],
            where: this.sqlAnd().addSql("mh.materiacurso=@materiacurso",
                { materiacurso: this.value("materiacurso") })
        })
    }

}

module.exports.AsistenciasService = AsistenciasService; 