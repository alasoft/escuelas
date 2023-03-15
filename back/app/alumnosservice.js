const { ServiceBase } = require("../lib/service/servicebase");
const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");
const { Sql } = require("../lib/sql/sql");
const { SqlDelete, SqlDeleteWhere, SqlInsert } = require("../lib/sql/sqloperations");
const { SqlSelect } = require("../lib/sql/sqlselect");
const { TextBuilder } = require("../lib/utils/textbuilder");

class AlumnosListService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "alu.id",
                "alu.nombre",
                "alu.apellido",
                "alu.genero",
                "alu.email"
            ],
            from: "alumnos alu",
            where: this.sqlAnd()
                .addIf(this.isDefined("curso"), () =>
                    this.sqlText("alu.curso=@curso", {
                        curso: this.value("curso")
                    }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("alu.nombre || alu.apellido ilike @descripcion", {
                        descripcion: this.value("descripcion")
                    })
                ),
            order: "alu.apellido,alu.nombre"
        }
    }

}

class AlumnosGetService extends TableGetService {

    sqlParameters() {
        return {
            columns: [
                "alu.id",
                "alu.nombre",
                "alu.apellido",
                "alu.genero"
            ],
            from: "alumnos alu",
            where: "id=@id",
            parameters: { id: this.id() }
        }
    }

}

class AlumnosInsertService extends TableInsertService {

    requiredValues() {
        return "curso,apellido,nombre"
    }

    sqlNotDuplicated() {
        return AlumnosCommonService.SqlNotDuplicated(this);
    }

}

class AlumnosUpdateService extends TableUpdateService {

    sqlNotDuplicated() {
        return AlumnosCommonService.SqlNotDuplicated(this);
    }

}

class AlumnosDeleteService extends TableDeleteService {

}

class AlumnosMoveService extends ServiceBase {

    execute() {
        this.validate()
            .then(() =>
                this.alumnosDuplicados())
            .then(() =>
                this.alumnosValidos())
            .then(() =>
                this.moveValidos())
            .then(() =>
                this.sendOkey())
            .catch(err =>
                this.sendError(err))
    }

    requiredFields() {
        return "cursoorigen,cursodestino,idsorigen"
    }

    alumnosDuplicados() {
        return this.dbExecute(this.sqlAlumnosDuplicadosDestino())
            .then(rows =>
                this.alumnosDuplicadosDestino = rows)
    }

    sqlAlumnosDuplicadosDestino() {
        return this.sqlSelect({
            columns: ["id", "apellido", "nombre"],
            tableName: "alumnos ori",
            where: this.sqlAnd()
                .addSql("ori.curso=@curso", { curso: this.value("cursoorigen") })
                .add(this.sqlIn("ori.id in", this.value("idsorigen")))
                .addSql("exists(@sql)", { sql: this.sqlAlumnoDuplicadoDestino() })
        })
    }

    alumnosValidos() {
        this.dbExecute(this.sqlAlumnosValidos())
            .then(rows =>
                this.alumnosValidos = rows)
    }

    sqlAlumnosValidos() {
        return this.sqlSelect({
            columns: ["id", "apellido", "nombre"],
            tableName: "alumnos alu",
            where: this.sqlAnd()
                .add(this.sqlIn("alu.id", this.value("idsorigen")))
                .addIf(this.alumnosDuplicados != undefined, () =>
                    "not " + this.sqlIn("alu.id", this.alumnosDuplicados))
        })
    }

    sqlAlumnoDuplicadoDestino() {
        return this.sqlSelect({
            columns: ["id"],
            tableName: "alumnos des",
            where: this.sqlAnd()
                .addSql("des.curso=@curso", { curso: this.value("cursodestino") })
                .add("upper(des.apellido)=upper(ori.apellido)")
                .add("upper(des.nombre)=upper(ori.nombre")
        })
    }

    moveValidos() {
        return this.dbExecute(this.sqlMoveValidos());
    }

    sqlMoveValidos() {
        return Sql.Transact(this.sqlsMoveValidos())
    }

    sqlsMoveValidos() {
        return this.sqlsDeleteOrigen().concat(this.sqlInsertDestino());
    }

    sqlsDeleteOrigen() {
        const sqls = [];
        this.alumnosValidos.forEach(alumno => sqls.push(new SqlDelete({
            tableName: "alumnos",
            values: {
                tenant: this.tenant(),
                id: alumnno.id
            }
        })))
        return sqls;
    }

    sqlInsertDestino() {
        const sqls = [];
        this.alumnosValidos.forEach(alumnno => this.sqls.push(new SqlInsert({
            tableName: "alumnos",
            values: {
                tenant: this.tenant(),
                apellido: alumnno.apellido,
                nombre: alumnno.nombre,
                email: alumno.email
            }
        })))
        return sqls;
    }

}

class AlumnosCommonService {

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "alumnos",
            where: service.sqlAnd([
                "curso=@curso",
                "upper(apellido)=upper(@apellido)",
                "upper(nombre)=upper(@nombre)"
            ]),
            parameters: service.jsonValues("curso,apellido,nombre")
        })
    }

}

module.exports.AlumnosListService = AlumnosListService;
module.exports.AlumnosGetService = AlumnosGetService
module.exports.AlumnosInsertService = AlumnosInsertService;
module.exports.AlumnosUpdateService = AlumnosUpdateService;
module.exports.AlumnosDeleteService = AlumnosDeleteService;