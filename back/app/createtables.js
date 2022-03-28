const { CreateTablesBase } = require("../lib/app/createtablesbase");
const { Sql } = require("../lib/sql/sql");
const { SqlType } = require("../lib/sql/sqltype");

class CreateTables extends CreateTablesBase {

    sql() {
        return [
            Sql.CreateSimple("escuelas"),
            Sql.CreateSimple("materias"),
            Sql.CreateSimple("modalidades"),
            Sql.Create({
                tableName: "cursos",
                columns: {
                    añolectivo: SqlType.Integer(),
                    escuela: SqlType.Fk(),
                    modalidad: SqlType.Fk(),
                    año: SqlType.Integer(),
                    division: SqlType.String({ size: 5 }),
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