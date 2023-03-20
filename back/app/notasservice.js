const { ServiceBase } = require("../lib/service/servicebase");
const { TableListService } = require("../lib/service/tableservice");
const { Exceptions } = require("../lib/utils/exceptions");
const { Utils } = require("../lib/utils/utils")

class NotasListService extends TableListService {

    execute() {
        this.validate()
            .then(() =>
                this.dbExecute(this.sql()))
            .then(rows =>
                this.sendRows(rows))
            .catch(err =>
                this.sendError(err))
    }

    requiredValues() {
        return "alumno,materiacurso";
    }

    sql() {
        return this.sqlSelect({
            columns: [
                "tp.id",
                "tp.nombre",
                "tp.desde",
                "tp.hasta",
                "tp.periodo",
                "per.nombre as periodonombre",
                "per.desde as periododesde",
                "per.hasta as periodohasta",
                "nt.nota",
            ],
            from: "tps tp",
            joins: [
                { tableName: "periodos", alias: "per", columnName: "tp.periodo" },
                {
                    tableName: "notas",
                    alias: "nt",
                    condition: this.sqlAnd()
                        .add("nt.tp=tp.id")
                        .addSql("nt.alumno=@alumno", { alumno: this.value("alumno") })
                }
            ],
            where: this.sqlAnd()
                .addSql("tp.materiacurso=@materiacurso", { materiacurso: this.value("materiacurso") })
        })
    }

}

class NotasUpdateService extends ServiceBase {

    execute() {
        this.validate()
            .then(() =>
                this.defineSql())
            .then(sql =>
                this.dbExecute(sql))
            .then(() =>
                this.sendOkey(this.values()))
            .catch(err =>
                this.sendError(err))
    }

    validate() {
        return this.validateRequiredValues()
            .then(() =>
                this.validateNota())
    }

    requiredValues() {
        return "alumno,tp";
    }

    validateNota() {
        const nota = this.value("nota");
        if (Utils.IsDefined(nota) && (nota < 1 || 10 < nota)) {
            throw Exceptions.Validation({
                code: Exceptions.NOTA_OUT_OF_RANGE,
                message: "La nota debe estar entre 1 y 10"
            })
        }
    }

    defineSql() {
        return this.dbExists(this.sqlExistsNota())
            .then(exists => {
                if (exists) {
                    if (this.isDefined("nota")) {
                        return this.sqlUpdateNota()
                    } else {
                        return this.sqlDeleteNota()
                    }
                } else {
                    return this.sqlInsertNota();
                }
            })
    }

    sqlExistsNota() {
        return this.sqlSelect({
            columns: [
                "id"
            ],
            from: "notas",
            where: this.sqlAnd()
                .add("alumno=@alumno")
                .add("tp=@tp"),
            parameters: this.jsonValues("alumno,tp")
        })
    }

    sqlInsertNota() {
        return this.sqlInsert({
            tableName: "notas",
            values: this.jsonValues("alumno,tp,nota")
        })
    }

    sqlUpdateNota() {
        return this.sqlUpdateWhere({
            tableName: "notas",
            values: this.jsonValues("nota"),
            where: this.whereAlumnoTp()
        })
    }

    sqlDeleteNota() {
        return this.sqlDeleteWhere({
            tableName: "notas",
            where: this.whereAlumnoTp()
        })
    }

    whereAlumnoTp() {
        return this.sqlAnd()
            .addSql("alumno=@alumno", {
                alumno: this.value("alumno")
            })
            .addSql("tp=@tp", {
                tp: this.value("tp")
            })
    }

}

module.exports.NotasListService = NotasListService;
module.exports.NotasUpdateService = NotasUpdateService;