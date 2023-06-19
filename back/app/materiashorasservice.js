const { Utils, Dates, Strings } = require("../lib/utils/utils");
const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");
const { AsistenciasEstados } = require("./asistenciasestados");
const { Sql } = require("../lib/sql/sql");

class MateriasHorasListService extends TableListService {

    sqlParameters() {
        return Utils.Merge(
            MateriasHorasCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: this.sqlAnd()
                .add(this.sqlText("mh.materiacurso=@materiacurso", { materiacurso: this.value("materiacurso") })),
            order: [
                "mh.dia",
                "mh.desde"
            ]
        }
    }

}

class MateriasHorasGetService extends TableGetService {

    sqlParameters() {
        return {
            columns: [
                "mh.id",
                "mh.materiacurso",
                "mh.dia",
                "mh.desde",
                "mh.hasta",
                "mat.nombre as materianombre",
                "cur.id as curso"
            ],
            from: "materias_horas mh",
            joins: [
                { tableName: "materias_cursos", alias: "mc", columnName: "mh.materiacurso" },
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
                { tableName: "materias", alias: "mat", columnName: "mc.materia" }
            ],
            where: "mh.id=@id",
            parameters: { id: this.id() }
        }
    }

}

class MateriasHorasInsertService extends TableInsertService {

    validate() {
        return super.validate()
            .then(() =>
                MateriasHorasCommonService.ValidateDesdeHasta(this))
    }

    requiredValues() {
        return "materiacurso,dia,desde,hasta"
    }

    validateNotDuplicated() { }

}

class MateriasHorasUpdateService extends TableUpdateService {

    validate() {
        return super.validate()
            .then(() =>
                MateriasHorasCommonService.ValidateDesdeHasta(this))
    }

    validateNotDuplicated() { }

}

class MateriasHorasDeleteService extends TableDeleteService { }


class MateriasHorasCommonService {

    static SqlBaseParameters(service) {
        return {
            columns: [
                "mh.id",
                "mh.materiacurso",
                "mh.dia",
                "mh.desde",
                "mh.hasta",
            ],
            from: "materias_horas mh",
        }
    }

    static ValidateDesdeHasta(service) {
        this.ValidateDesdeLowerHasta(service);
        return this.ValidateNoDesdeHastaCollision(service);
    }

    static ValidateDesdeLowerHasta(service) { }

    static ValidateNoDesdeHastaCollision(service) { }

}

class MateriasHorasInsert {

    constructor(service) {
        this.service = service;
    }

    execute() {
        return this.service.dbSelect(this.sqlPeriodos())
            .then(rows =>
                this.periodosRows = rows)
            .then(() =>
                this.sqlHorasAsistencias())
            .then(sql =>
                this.service.dbExecute(sql))
    }

    sqlPeriodos() {
        return this.sqlSelect({
            columns: [
                "id",
                "desde",
                "hasta"],
            from: "periodos",
            order: "desde"
        })
    }

    sqlHorasAsistencias() {
        return new Sql.Transact([
            this.sqlHoras(),
            this.sqlAsistencias()
        ])
    }

    sqlHoras() {
        return this.service.sqlInsert({
            tableName: "materias_horas",
            values: Utils.Merge(this.service.jsonValues("materiacurso,dia,desde,hasta"))
        })
    }

    sqlAsistencias() {
        const sqls = []
        for (const periodoRow of this.periodosRows) {
            const dates = Dates.DatesForDayOfWeek(this.service.value("dia"), periodoRow.desde, periodoRow.hasta);
            for (const date of dates) {
                sqls.push(this.sqlAsistencia(periodoRow, date))
            }
        }
    }

    sqlAsistencia(periodoRow, date) {
        return this.service.sqlInsert({
            tableName: "asistencias_fechas",
            values: { horario: this.materiasHorasId(), periodo: periodoRow.id, fecha: date, estado: AsistenciasEstados.ESTADO_NORMAL }
        })
    }

    materiasHorasId() {
        if (this._masteriasHorasId == undefined) {
            this._masteriasHorasId = Strings.NewGuid()
        }
        return this._masteriasHorasId;
    }

}

class MateriasHorasUpdate extends MateriasHorasInsert {

    sqlHorasAsistencias() {
        return new Sql.Transact([
            this.sqlHoras(),
            this.sqlDeleteAsistencias(),
            this.sqlAsistencias()
        ])
    }

    sqlDeleteAsistencias() {
        return [
            this.sqlDeleteAsistenciasAlumnos(),
            this.sqlDeleteAsistenciasFechas()
        ]
    }

    sqlDeleteAsistenciasAlumnos() {
        return this.service.sqlDeleteWhere({
            tableName: "asistencias_alumnos",
            where: "asistencia in " + this.sqlAsistenciasFechas()
        })
    }

    sqlAsistenciasFechas() {
        return this.service.sqlSelect({
            columns: "id",
            from: "asistencias_fechas",
            where: "horario=@horario",
            parameters: { horario: this.service.id() }
        }).text()
    }

    sqlDeleteAsistenciasFechas() {
        return this.service.sqlDeleteWhere({
            tableName: "asistencias_fechas",
            where: this.service.sqlText("horario=@horario", { horarios: this.service.id() })
        })
    }

}

module.exports.MateriasHorasListService = MateriasHorasListService;
module.exports.MateriasHorasGetService = MateriasHorasGetService;
module.exports.MateriasHorasInsertService = MateriasHorasInsertService;
module.exports.MateriasHorasUpdateService = MateriasHorasUpdateService;
module.exports.MateriasHorasDeleteService = MateriasHorasDeleteService;