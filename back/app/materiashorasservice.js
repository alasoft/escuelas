const { Utils, Strings } = require("../lib/utils/utils");
const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");
const { Exceptions } = require("../lib/utils/exceptions");
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
        return this.validateRequiredValues()
            .then(() =>
                MateriasHorasCommonService.ValidateDesdeHasta(this))
    }

    requiredValues() {
        return "materiacurso,dia,desde,hasta"
    }

}

class MateriasHorasUpdateService extends TableUpdateService {

    validate() {
        return this.validateRequiredValues()
            .then(() =>
                MateriasHorasCommonService.ValidateDesdeHasta(this))
    }

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

    static ValidateDesdeLowerHasta(service) {
        if (service.compare("desde", "hasta") >= 0) {
            throw Exceptions.HoraDesdeDebeSerMenorHoraHasta({ detail: service.jsonValues("desde,hasta") })
        }
    }

    static ValidateNoDesdeHastaCollision(service) {

        function sql() {
            return service.sqlSelect({
                columns: [
                    "id",
                    "desde",
                    "hasta",
                ],
                from: "materias_horas",
                where: "dia=@dia",
                parameters: {
                    dia: service.value("dia")
                }
            })
        }

        function validateRange(rows) {
            rows.forEach(row => {
                if (Utils.Intersect(service.value("desde"), service.value("hasta"),
                    Strings.AsHour(row.desde), Strings.AsHour(row.hasta))) {
                    throw row
                }
            })
        }

        function sqlCursoMateria(row) {
            return service.sqlSelect({
                columns: [
                    "cur.año",
                    "cur.division",
                    "cur.turno",
                    "esc.nombre as escuelanombre",
                    "mod.nombre as modalidadnombre",
                    "mat.nombre as materianombre",
                    Sql.Value(Strings.Left(row.desde, 5)) + " as desde",
                    Sql.Value(Strings.Left(row.hasta, 5)) + " as hasta"
                ],
                from: "materias_horas mh",
                joins: [
                    { tableName: "materias_cursos", alias: "mc", columnName: "mh.materiacurso" },
                    { tableName: "cursos", alias: "cur", columnName: "mc.curso" },
                    { tableName: "escuelas", alias: "esc", columnName: "cur.escuela" },
                    { tableName: "modalidades", alias: "mod", columnName: "cur.modalidad" },
                    { tableName: "materias", alias: "mat", columnName: "mc.materia" }
                ],
                where: "mh.id=@id",
                parameters: { id: row.id }
            })
        }

        return service.db.select(sql())
            .then(rows =>
                validateRange(rows))
            .catch(row =>
                service.db.selectOne(sqlCursoMateria(row)))
            .then(row => {
                throw Exceptions.HorarioColision({ detail: row })
            })
    }

}

module.exports.MateriasHorasListService = MateriasHorasListService;
module.exports.MateriasHorasGetService = MateriasHorasGetService;
module.exports.MateriasHorasInsertService = MateriasHorasInsertService;
module.exports.MateriasHorasUpdateService = MateriasHorasUpdateService;
module.exports.MateriasHorasDeleteService = MateriasHorasDeleteService;