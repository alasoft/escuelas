const { Sql } = require("../sql/sql");
const { SqlDeleteAll } = require("../sql/sqloperations");
const { ServiceBase } = require("./servicebase");

class TablesService extends ServiceBase {

    static tableNames = [
        "escuelas",
        "materias",
        "modalidades",
        "cursos",
        "alumnos",
        "materias_cursos",
        "materias_horas",
        "periodos",
        "tps",
        "notas"
    ];
}

class TablesDeleteService extends TablesService {

    execute() {
        this.validate()
            .then(() =>
                this.delete())
            .then(() =>
                this.sendOkey())
    }

    delete() {
        return this.dbExecute(this.sql())
    }

    sql() {
        return Sql.Transact(this.sqls())
    }

    sqls() {
        const sqls = [];
        TablesService.tableNames.forEach(
            tableName => sqls.push(new SqlDeleteAll({
                tableName: tableName,
                values: { tenant: this.tenant() }
            }))
        )
        return sqls;
    }

}