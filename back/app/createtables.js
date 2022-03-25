const { CreateTablesBase } = require("./createtablesbase");
const { Sql } = require("./sql");
const { SqlType } = require("./sqltype");

class CreateTables extends CreateTablesBase {

    sql() {
        return [
            Sql.CreateSimple("escuelas"),
            Sql.CreateSimple("materias"),
            Sql.CreateSimple("modalidades"),
            Sql.Create({
                tableName: "cursos",
                columns: {
                    añoLectivo: SqlType.Integer(),
                    escuela: SqlType.Fk(),
                    modalidad: SqlType.Fk(),
                    año: SqlType.Integer(),
                    division: SqlType.Char(),
                    turno: SqlType.Char({ size: 1 })
                }
            }),
            Sql.Create({
                tableName: "alumnos",
                columns: {
                    curso: SqlType.Fk(),
                    apellido: SqlType.Apellido(),
                    nombre: SqlType.Nombre()
                }
            }),
            Sql.Create({
                tableName: "materias_cursos",
                columns: {
                    curso: SqlType.Fk(),
                    materia: SqlType.Fk()
                }
            })
        ]
    }
}

module.exports.CreateTables = CreateTables;