const { App } = require("../lib/app/app");
const { Años } = require("./años");
const { CreateTables } = require("./createtables");
const { MemoryTableRest } = require("../lib/rest/memorytablerest");
const { Postgres } = require("../lib/data/postgres");
const { SimpleTableRest } = require("../lib/rest/simpletablerest");
const { Turnos } = require("./turnos");
const { CursosRest } = require("./cursosrest");
const { MateriasCursosRest } = require("./materiascursosrest");

new App({
    port: 9090,
    root: "escuelas",
    dbConnection: dbConnection,
    createTables: CreateTables,
    restItems: restItems,
    tokenTime: 30
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
        new SimpleTableRest({ app: app, tableName: "escuelas", duplicatedMessage: "Escuela duplicada" }),
        new SimpleTableRest({ app: app, tableName: "modalidades", duplicatedMessage: "Modalidad duplicada" }),
        new SimpleTableRest({ app: app, tableName: "materias", duplicatedMessage: "Materia duplicada" }),
        new CursosRest({ app: app }),
        new MateriasCursosRest({ app: app })
    ]
}