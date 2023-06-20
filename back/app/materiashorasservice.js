const { Utils, Dates, Strings } = require("../lib/utils/utils");
const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");
const { AsistenciasEstados } = require("./asistenciasestados");
const { Sql, SqlCommands } = require("../lib/sql/sql");
const { Exceptions } = require("../lib/utils/exceptions");

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
                "to_char(mh.desde,'hh24:mi') as desde",
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

    execute() {
        new MateriasHorasInsert(this).execute()
    }

}

class MateriasHorasUpdateService extends TableUpdateService {

    execute() {
        new MateriasHorasUpdate(this).execute()
    }

}

class MateriasHorasDeleteService extends TableDeleteService {

    execute() {
        new MateriasHorasDelete(this).execute()
    }

}


class MateriasHorasCommonService {

    static SqlBaseParameters(service) {
        return {
            columns: [
                "mh.id",
                "mh.materiacurso",
                "mh.dia",
                "to_char(mh.desde,'hh24:mi') as desde",
                "mh.hasta",
            ],
            from: "materias_horas mh",
        }
    }

}

class MateriasHorasSqlBase {

    constructor(service) {
        this.service = service;
    }

    sqlPeriodos() {
        return this.service.sqlSelect({
            columns: [
                "id",
                "desde",
                "hasta"],
            from: "periodos",
            order: "desde"
        })
    }

    sqlInsertAll() {
        return new SqlCommands()
            .add(this.sqlInsertHoras())
            .add(this.sqlInsertAsistenciasFechas())
    }

    sqlInsertHoras() {
        return this.service.sqlInsert({
            tableName: "materias_horas",
            values: this.materiasHorasValues()
        })
    }

    sqlInsertAsistenciasFechas() {
        const sqls = new SqlCommands()
        for (const periodoRow of this.periodosRows) {
            const dates = Dates.DatesForDayOfWeek(this.service.value("dia"), periodoRow.desde, periodoRow.hasta);
            for (const date of dates) {
                sqls.add(this.sqlInsertAsistenciaFecha(periodoRow, date))
            }
        }
        return sqls;
    }

    sqlInsertAsistenciaFecha(periodoRow, date) {
        return this.service.sqlInsert({
            tableName: "asistencias_fechas",
            values: { horario: this.service.id(), periodo: periodoRow.id, fecha: date, estado: AsistenciasEstados.ESTADO_NORMAL }
        })
    }

    sqlUpdateHoras() {
        return this.service.sqlUpdate({
            tableName: "materias_horas",
            values: this.materiasHorasValues()
        })
    }

    sqlDeleteHoras() {
        return this.service.sqlDeleteWhere({
            tableName: "materias_horas",
            where: this.service.sqlText("id=@id", { id: this.service.id() })
        })
    }

    sqlDeleteAll() {
        return new SqlCommands()
            .add(this.sqlDeleteAsistencias())
            .add(this.sqlDeleteHoras())
    }

    sqlDeleteAsistencias() {
        return new SqlCommands()
            .add(this.sqlDeleteAsistenciasAlumnos())
            .add(this.sqlDeleteAsistenciasFechas())
    }

    sqlDeleteAsistenciasAlumnos() {

        function sqlAsistenciasFechas(service) {
            return service.sqlSelect({
                columns: "id",
                from: "asistencias_fechas",
                where: "horario=@horario",
                parameters: { horario: service.id() }
            })
        }

        return this.service.sqlDeleteWhere({
            tableName: "asistencias_alumnos",
            where: "asistenciafecha in (" + sqlAsistenciasFechas(this.service) + ")"
        })

    }

    sqlDeleteAsistenciasFechas() {
        return this.service.sqlDeleteWhere({
            tableName: "asistencias_fechas",
            where: this.service.sqlText("horario=@horario", { horario: this.service.id() })
        })
    }

    materiasHorasValues() {
        return this.service.jsonValues("materiacurso,dia,desde,hasta,fechahasta")
    }

}

class MateriasHorasInsertUpdate extends MateriasHorasSqlBase {

    execute() {
        return this.validate()
            .then(() =>
                this.service.dbSelect(this.sqlPeriodos()))
            .then(rows =>
                this.periodosRows = rows)
            .then(() =>
                this.defineSql())
            .then(sql =>
                this.service.dbExecute(sql))
            .then(() =>
                this.service.sendOkey({ id: this.service.id() }))
            .catch(err =>
                this.service.sendError(err))
    }

    validate() {
        return this.service.validateRequiredValues(this.requiredValues())
            .then(() =>
                this.validateDesdeLowerHasta())
            .then(() =>
                this.validateNoDesdeHastaCollision());
    }

    validateDesdeLowerHasta() {
        if (this.service.value("hasta") < this.service.value("desde")) {
            throw Exceptions.Validation({
                code: Exceptions.HORA_DESDE_DEBE_SER_MENOR_HORA_HASTA
            })
        }
    }

    validateNoDesdeHastaCollision() { }

}

class MateriasHorasInsert extends MateriasHorasInsertUpdate {

    execute() {
        return Promise.resolve(this.service.checkId())
            .then(() =>
                super.execute())
    }

    requiredValues() {
        return "materiacurso,dia,desde,hasta"
    }

    defineSql() {
        return Sql.Transact(
            this.sqlInsertAll()
        )
    }

}

class MateriasHorasUpdate extends MateriasHorasInsert {

    requiredValues() {
        return "id,materiacurso,dia,diaanterior,desde,hasta"
    }

    defineSql() {
        if (this.service.value("dia") != this.service.value("diaanterior")) {
            return new SqlCommands()
                .add(this.sqlDeleteAll())
                .add(this.sqlInsertAll())
                .transact()

        } else {
            return this.sqlUpdateHoras()
        }
    }

}

class MateriasHorasDelete extends MateriasHorasSqlBase {

    execute() {
        return this.validate()
            .then(() =>
                this.defineSql())
            .then(sql =>
                this.service.dbExecute(sql))
            .then(() =>
                this.service.sendOkey({ id: this.service.id() }))
            .catch(err =>
                this.sendError(err))
    }

    validate() {
        return this.service.validateRequiredValues("id")
    }

    defineSql() {
        return Sql.Transact(
            this.sqlDeleteAll()
        )
    }

}

module.exports.MateriasHorasListService = MateriasHorasListService;
module.exports.MateriasHorasGetService = MateriasHorasGetService;
module.exports.MateriasHorasInsertService = MateriasHorasInsertService;
module.exports.MateriasHorasUpdateService = MateriasHorasUpdateService;
module.exports.MateriasHorasDeleteService = MateriasHorasDeleteService;