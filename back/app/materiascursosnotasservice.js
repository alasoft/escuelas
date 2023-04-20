const { ServiceBase } = require("../lib/service/servicebase");

class MateriasCursosNotasListService extends ServiceBase {

    foo() {
        this.sqlSelect({
            columns: ["mc.id",
                "mc.curso",
                "mc.materia",
                "cur.añolectivo",
                "cur.escuela",
                "cur.modalidad",
                "cur.año",
                "cur.division",
                "cur.turnso"
            ],
            from: "materias_cursos mc",
            joins: [
                { tableName: "cursos", alias: "cur", columnName: "mc.curso" }
            ]
        })
    }
}