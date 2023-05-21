const { ServiceBase } = require("../lib/service/servicebase");

class CursosMateriasCountService extends ServiceBase {

    execute() {
        this.dbExecute(this.sqlAlumnos())
            .then(count =>
                this.alumnosCount = count)
            .then(() =>
                this.dbExecute(this.sqlExamenes()))
            .then(count =>
                this.examenesCount = count)
            .then(() =>
                this.dbExecute(this.sqlNotas()))
            .then(count =>
                this.notasCount = count)
            .then(() =>
                this.sendOkey(this.dataToSend()))
            .catch(err =>
                this.sendError)
    }

    requiredValues() {
        return "añolectivo";
    }

    sqlAlumnos() {
        return this.sqlSelect({
            column: [
                "al.curso",
                "count(*)"
            ],
            from: "alumnos al",
            joins: [{
                tableName: "cursos", alias: "cur", columnName: "al.curso",
                tableName: "periodos", alias: "per", columnName: "exa.periodo"
            }],
            where: this.sqlAnd([
                "per.añolectivo=@añolectivo"
            ]),
            group: [
                "al.curso"
            ]
        })
    }

    sqlExamenes() {
        return this.sqlSelect(
            {
                column: [
                    "mc.curso",
                    "exa.materiacurso",
                    "exa.periodo",
                    "count(*)"
                ],
                from: "examenes exa",
                joins: [{
                    tableName: "materias_cursos", alias: "mc", columnName: "exa.materiacurso",
                    tableName: "periodos", alias: "per", columnName: "exa.periodo"
                }],
                where: this.sqlAnd([
                    "per.añolectivo=@añolectivo",
                    "exa.desde<=now()"
                ]),
                group: [
                    "mc.curso",
                    "exa.materiacurso",
                    "exa.periodo"
                ],
                parameters: { añolectivo: this.value("añolectivo") }
            }
        )
    }

    sqlNotas() {
        return this.sqlSelect(
            {
                column: [
                    "mc.curso",
                    "exa.materiacurso",
                    "exa.periodo",
                    "count(*)"
                ],
                from: "notas nt",
                joins: [{
                    tableName: "examenes", alias: "exa", columnName: "nt.examen",
                    tableName: "materias_cursos", alias: "mc", columnName: "exa.materiacurso",
                    tableName: "periodos", alias: "per", columnName: "exa.periodo"
                }],
                where: this.sqlAnd([
                    "per.añolectivo=@añolectivo",
                    "exa.desde<=now()"
                ]),
                group: [
                    "mc.curso",
                    "exa.materiacurso",
                    "exa.periodo"
                ],
                parameters: { añolectivo: this.value("añolectivo") }
            }
        )
    }

    dataToSend() {
        return {
            alumnosCount: this.alumnosCount,
            examenesCount: this.examenesCount,
            notasCount: this.notasCount
        }
    }

}

module.exports.CursosMateriasCountService = CursosMateriasCountService;