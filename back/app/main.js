const minimist = require("minimist");

const { App } = require("../lib/app/app");
const { Años } = require("./años");
const { CreateTables } = require("./createtables");
const { MemoryTableRest } = require("../lib/rest/memorytablerest");
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

//const args = minimist(process.argv.slice(2));

new App({
    createTables: CreateTables,
    restItems: restItems,
}).start()


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
        new MateriasHorasAllRest({ app: app }),
        new AlumnosRest({ app: app }),
        new ExamenesRest({ app: app }),
        new ExamenesAllRest({ app: app }),
        new NotasRest({ app: app }),
        new NotasDataRest({ app: app })
    ]
}