const { App } = require("./app");
const { Años } = require("./años");
const { MemoryTableRest } = require("./memorytablerest");
const { Postgres } = require("./postgres");
const { SimpleTableRest } = require("./simpletablerest");
const { Sql } = require("./sql");
const { Turnos } = require("./turnos");

new App({
    port: 9090,
    root: "escuelas",
    dbConnection: dbConnection,
    createTables: createTables,
    restItems: restItems
}).start()

function dbConnection(app) {
    return new Postgres({
        app: app,
        user: "postgres",
        password: "postgres",
        database: "alasoft_escuelas"
    })
}

function createTables(app) {
    return [
        Sql.CreateSimple("escuelas"),
        Sql.CreateSimple("materias"),
        Sql.CreateSimple("modalidades"),
    ]
}

function restItems(app) {
    return [
        new MemoryTableRest({ app: app, tableClass: Años }),
        new MemoryTableRest({ app: app, tableClass: Turnos }),
        new SimpleTableRest({ app: app, tableName: "materias" })
    ]
}