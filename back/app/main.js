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
const { ExamenesRest } = require("./examenesrest");
const { ExamenesAllRest } = require("./examenesallrest");
const { ExamenesTipos } = require("./examenestipos");
const { NotasRest } = require("./notasrest");
const { NotasDataRest } = require("./notasdatarest");
const { ValoracionesRest } = require("./valoracionesrest");
const { PeriodosEstados } = require("./periodosestados");
const { CursosMateriasRest } = require("./cursosmateriasrest")
const { ServerRest } = require("../lib/rest/serverrest");
const minimist = require("minimist")

const args = minimist(process.argv.slice(2));

//console.log(args);

new App({
    host: hostOrDefault(),
    port: isDemoElse(9091, 9090),
    root: isDemoElse("escuelas_demo", "escuelas"),
    static: "escuelas",
    dbConnection: dbConnection,
    createTables: CreateTables,
    restItems: restItems,
    tokenMinutes: 120,
    version: "0.9.4",
    name: "Solución Docente",
    logSql: false,
    obfuscated: obfuscatedOrDefault(true),
    demo: isDemo(),
    demoMaxAlumnos: 50
}).start()

function hostOrDefault(defaultHost = "http://127.0.0.1") {
    if (args.host != undefined) {
        return args.host
    } else {
        return defaultHost;
    }
}

function isDemo() {
    return args.demo == true;
}

function isDemoElse(x1, x2) {
    if (isDemo()) {
        return x1;
    } else {
        return x2;
    }
}

function obfuscatedOrDefault(obfuscated = false) {
    if (args.obfuscated != undefined) {
        return args.obfuscated;
    } else {
        return obfuscated;
    }
}

function dbConnection(app) {
    return new Postgres({
        app: app,
        user: "postgres",
        password: "postgres",
        database: isDemoElse("alasoft_escuelas_demo", "alasoft_escuelas")
    })
}

function restItems(app) {
    return [
        new ServerRest({ app: app }),
        new MemoryTableRest({ app: app, tableClass: Años }),
        new MemoryTableRest({ app: app, tableClass: Turnos }),
        new MemoryTableRest({ app: app, tableClass: ExamenesTipos }),
        new MemoryTableRest({ app: app, tableClass: PeriodosEstados }),
        new SimpleTableRest({ app: app, tableName: "escuelas", }),
        new SimpleTableRest({ app: app, tableName: "modalidades", }),
        new SimpleTableRest({ app: app, tableName: "materias", }),
        new PeriodosRest({ app: app }),
        new ValoracionesRest({ app: app }),
        new CursosRest({ app: app }),
        new CursosMateriasRest({ app: app }),
        new MateriasCursosRest({ app: app }),
        new MateriasHorasRest({ app: app }),
        new MateriasHorasAllRest({ app: app, path: "materias_horas_all" }),
        new AlumnosRest({ app: app }),
        new ExamenesRest({ app: app }),
        new ExamenesAllRest({ app: app, path: "Examenes_all" }),
        new NotasRest({ app: app }),
        new NotasDataRest({ app: app })
    ]
}