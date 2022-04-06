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
                    escuela: SqlType.Fk({ references: "escuelas" }),
                    modalidad: SqlType.Fk({ references: "modalidades" }),
                    año: SqlType.Integer(),
                    division: SqlType.String({ size: 5 }),
                    turno: SqlType.Char({ size: 1 })
                }
            }),
            Sql.Create({
                tableName: "alumnos",
                columns: {
                    curso: SqlType.Fk({ references: "cursos" }),
                    apellido: SqlType.Apellido(),
                    nombre: SqlType.Nombre(),
                    genero: SqlType.Char({ size: 1 })
                }
            }),
            Sql.Create({
                tableName: "materias_cursos",
                columns: {
                    curso: SqlType.Fk({ references: "cursos" }),
                    materia: SqlType.Fk({ references: "materias" })
                }
            }),
            Sql.Create({
                tableName: "periodos",
                columns: {
                    añolectivo: SqlType.Integer(),
                    nombre: SqlType.String(),
                    desde: SqlType.Date(),
                    hasta: SqlType.Date()
                }
            }),
            Sql.Create({
                tableName: "tps",
                columns: {
                    materiacurso: SqlType.Fk({ references: "materias_cursos" }),
                    periodo: SqlType.Fk({ references: "periodos" }),
                    nombre: SqlType.String(),
                    desde: SqlType.Date(),
                    hasta: SqlType.Date()
                }
            }),
            Sql.Create({
                tableName: "evaluaciones",
                columns: {
                    alumno: SqlType.Fk({ references: "alumnos" }),
                    tp: SqlType.Fk({ references: "tps" }),
                    evaluacion: SqlType.String({ size: 10 })
                }
            })
        ]
    }
}

module.exports.CreateTables = CreateTables;