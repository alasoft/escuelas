const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");
const { Utils, Dates } = require("../lib/utils/utils");
const { Sql } = require("../lib/sql/sql")

class MateriasCursosListService extends TableListService {

    sqlParameters() {
        return Utils.Merge(
            MateriasCursosCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: this.sqlAnd()
                .addIf(this.isDefined("curso"), () =>
                    this.sqlText("mc.curso=@curso", {
                        curso: this.value("curso")
                    }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("mat.nombre ilike @descripcion", {
                        descripcion: this.value("descripcion")
                    })
                ),
            order: "mat.nombre"
        }
    }

    sendRows(rows) {
        return this.dbSelect(this.sqlHorarios(this.materiasCursos(rows)))
            .then(hoursRows =>
                this.hoursRows = hoursRows)
            .then(() =>
                super.sendRows(rows))
    }

    materiasCursos(rows) {
        return rows.map(row =>
            row.id);
    }

    sqlHorarios(materiasCursos) {
        return this.sqlSelect({
            columns: [
                "materiacurso",
                "dia",
                "desde",
                "hasta"
            ],
            from: "materias_horas",
            where: this.sqlAnd().addIf(0 < materiasCursos.length, () =>
                this.sqlIn("materiacurso", materiasCursos))
        })
    }

    transformRow(row) {
        row.horarios = this.horarios(row.id)
    }

    horarios(materiacurso) {
        let horarios = "";
        for (const row of this.hoursRows) {
            if (row.materiacurso == materiacurso) {
                if (horarios != "") {
                    horarios += "<br><br>"
                }
                horarios += Dates.DayName(row.dia) + "  " + row.desde.substring(0, 5) + " - " + row.hasta.substring(0, 5)
            }
        }
        return horarios;
    }


}

class MateriasCursosGetService extends TableGetService {

    sqlParameters() {
        return Utils.Merge(
            MateriasCursosCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: "mc.id=@id",
            parameters: { id: this.id() }
        }
    }

}

class MateriasCursosInsertService extends TableInsertService {

    requiredValues() {
        return "curso,materia"
    }

    sqlNotDuplicated() {
        return MateriasCursosCommonService.SqlNotDuplicated(this);
    }

}

class MateriasCursosUpdateService extends TableUpdateService {

    sqlNotDuplicated() {
        return MateriasCursosCommonService.SqlNotDuplicated(this);
    }

}

class MateriasCursosDeleteService extends TableDeleteService {

    sql() {
        return Sql.Transact([this.sqlDeleteHoras(), super.sql()])
    }

    sqlDeleteHoras() {
        return this.sqlDeleteWhere({
            tableName: "materias_horas",
            where: this.sqlAnd().addSql("materiacurso=@materiacurso", { materiacurso: this.id() })
        })
    }

}

class MateriasCursosCommonService {

    static SqlBaseParameters(service) {
        return {
            columns: [
                "mc.id",
                "mc.curso",
                "mc.materia",
                "mat.nombre as materianombre"
            ],
            from: "materias_cursos mc",
            joins: [
                { tableName: "materias", alias: "mat", columnName: "mc.materia" },
            ]
        }
    }

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "materias_cursos",
            where: service.sqlAnd([
                "curso=@curso",
                "materia=@materia",
            ]),
            parameters: service.jsonValues("curso,materia")
        })
    }

}

module.exports.MateriasCursosListService = MateriasCursosListService;
module.exports.MateriasCursosGetService = MateriasCursosGetService
module.exports.MateriasCursosInsertService = MateriasCursosInsertService;
module.exports.MateriasCursosUpdateService = MateriasCursosUpdateService;
module.exports.MateriasCursosDeleteService = MateriasCursosDeleteService;