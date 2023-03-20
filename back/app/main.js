const { App } = require("../lib/app/app");
const { Años } = require("./años");
const { CreateTables } = require("./createtables");
const { MemoryTableRest } = require("../lib/rest/memorytablerest");
const { Postgres } = require("../lib/data/postgres");
const { SimpleTableRest } = require("../lib/rest/simpletablerest");
const { Turnos } = require("./turnos");
const { CursosRest } = require("./cursosrest");
const { MateriasCursosRest } = require("./materiascursosrest");
const { MateriasHorasRest } = require("./materiashorasrest");
const { MateriasHorasAllRest } = require("./materiashorasallrest");
const { AlumnosRest } = require("./alumnosrest");
const { PeriodosRest } = require("./periodosrest");
const { TpsRest } = require("./tpsrest");
const { TpsAllRest } = require("./tpsallrest");
const { NotasRest } = require("./notasrest");

new App({
    port: 9090,
    root: "escuelas",
    dbConnection: dbConnection,
    createTables: CreateTables,
    restItems: restItems,
    tokenMinutes: 120,
    version: "0.9",
    name: "Escuelas",
}).start()

function dbConnection(app) {
    return new Postgres({
        app: app,
        user: "postgres",
        password: "postgres",
        database: "alasoft_escuelas"
    })
}

function restItems(app) {
    return [
        new MemoryTableRest({ app: app, tableClass: Años }),
        new MemoryTableRest({ app: app, tableClass: Turnos }),
        new SimpleTableRest({
            app: app,
            tableName: "escuelas",
        }),
        new SimpleTableRest({
            app: app,
            tableName: "modalidades",
        }),
        new SimpleTableRest({
            app: app,
            tableName: "materias",
        }),
        new PeriodosRest({ app: app }),
        new CursosRest({ app: app }),
        new MateriasCursosRest({ app: app }),
        new MateriasHorasRest({ app: app }),
        new MateriasHorasAllRest({ app: app, path: "materias_horas_all" }),
        new AlumnosRest({ app: app }),
        new TpsRest({ app: app }),
        new TpsAllRest({ app: app, path: "tps_all" }),
        new NotasRest({ app: app })
    ]
}