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
                    turno: SqlType.Char({ size: 1 }),
                },
                unique: "añolectivo,escuela,modalidad,año,division,turno"
            }),
            Sql.Create({
                tableName: "alumnos",
                columns: {
                    curso: SqlType.Fk({ references: "cursos" }),
                    apellido: SqlType.Apellido(),
                    nombre: SqlType.Nombre(),
                    email: SqlType.String({ size: 100, required: false }),
                },
                unique: ["apellido,nombre", "email"]
            }),
            Sql.Create({
                tableName: "materias_cursos",
                columns: {
                    curso: SqlType.Fk({ references: "cursos" }),
                    materia: SqlType.Fk({ references: "materias" })
                },
                unique: "curso,materia"
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
                    preliminar: SqlType.Date({ required: false })
                },
                unique: "añolectivo,nombre"
            }),
            Sql.Create({
                tableName: "valoraciones",
                columns: {
                    añolectivo: SqlType.Integer(),
                    nombre: SqlType.String(),
                    sigla: SqlType.String({ size: 10 }),
                    desde: SqlType.Integer(),
                    hasta: SqlType.Integer(),
                },
                unique: ["añolectivo,nombre", "añolectivo,sigla"]
            }),
            Sql.Create({
                tableName: "examenes",
                columns: {
                    materiacurso: SqlType.Fk({ references: "materias_cursos" }),
                    periodo: SqlType.Fk({ references: "periodos" }),
                    nombre: SqlType.String(),
                    tipo: SqlType.Char({ size: 1 }),
                    desde: SqlType.Date(),
                    hasta: SqlType.Date(),
                },
                unique: "materiacurso,nombre"
            }),
            Sql.Create({
                tableName: "notas",
                columns: {
                    alumno: SqlType.Fk({ references: "alumnos" }),
                    examen: SqlType.Fk({ references: "examenes" }),
                    nota: SqlType.Integer()
                },
                unique: "alumno,examen"
            }),
            Sql.Create({
                tableName: "recuperatorios",
                columns: {
                    alumno: SqlType.Fk({ references: "alumnos" }),
                    periodo: SqlType.Fk({ references: "periodos" }),
                    nombre: SqlType.String(),
                    nota: SqlType.Integer()
                }
            }),
            Sql.Create({
                tableName: "asistencias",
                columns: {
                    fecha: SqlType.Date(),
                    hora: SqlType.Time(),
                    alumno: SqlType.Fk({ references: "alumnos" }),
                    asistio: SqlType.Boolean()
                }
            })
        ]
    }
}

module.exports.CreateTables = CreateTables;