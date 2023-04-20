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
                    email: SqlType.String({ size: 100, required: false })
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
                tableName: "materias_horas",
                columns: {
                    materiacurso: SqlType.Fk({ references: "materias_cursos" }),
                    dia: SqlType.Integer(),
                    desde: SqlType.Time(),
                    hasta: SqlType.Time()
                }
            }),
            Sql.Create({
                tableName: "periodos",
                columns: {
                    añolectivo: SqlType.Integer(),
                    nombre: SqlType.String(),
                    desde: SqlType.Date(),
                    hasta: SqlType.Date(),
                },
                unique: ["nombre"]
            }),
            Sql.Create({
                tableName: "evaluaciones",
                columns: {
                    materiacurso: SqlType.Fk({ references: "materias_cursos" }),
                    periodo: SqlType.Fk({ references: "periodos" }),
                    nombre: SqlType.String(),
                    tipo: SqlType.Char({ size: 1 }),
                    desde: SqlType.Date(),
                    hasta: SqlType.Date(),
                },
                unique: ["nombre"]
            }),
            Sql.Create({
                tableName: "notas",
                columns: {
                    alumno: SqlType.Fk({ references: "alumnos" }),
                    evaluacion: SqlType.Fk({ references: "evaluaciones" }),
                    nota: SqlType.Integer()
                },
                unique: ["alumno,evaluacion"]
            }),
            Sql.Create({
                tableName: "valoraciones",
                columns: {
                    nombre: SqlType.String(),
                    desde: SqlType.Integer(),
                    hasta: SqlType.Integer(),
                    sigla: SqlType.String({ size: 10 }),
                },
                unique: ["nombre", "sigla"]
            })
        ]
    }
}

module.exports.CreateTables = CreateTables;