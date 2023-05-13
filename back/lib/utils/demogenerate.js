const { Sqls } = require("../sql/sql");
const { SqlInsert } = require("../sql/sqloperations");
const { Utils, Strings, Dates } = require("./utils");

class DemoGenerate {

    constructor(parameters) {
        this.db = parameters.db;
        this.tenant = parameters.tenant;
    }

    generate() {
        return this.db.execute(this.sqls().transact())
    }

    sqls() {
        if (this._sqls == undefined) {
            this._sqls = this.defineSqls()
        }
        return this._sqls;
    }

    defineSqls() {
        return new Sqls().addArray(
            [
                this.escuelas().sqls(),
                this.modalidades().sqls(),
                this.materias().sqls(),
                this.cursos().sqls(),
                this.periodos().sqls()
            ])

    }

    escuelas() {
        if (this._escuelas == undefined) {
            this._escuelas = this.defineEscuelas()
        }
        return this._escuelas;
    }

    modalidades() {
        if (this._modalidades == undefined) {
            this._modalidades = this.defineModalidades()
        }
        return this._modalidades;
    }

    materias() {
        if (this._materias == undefined) {
            this._materias = this.defineMaterias()
        }
        return this._materias;
    }

    cursos() {
        if (this._cursos == undefined) {
            this._cursos = this.defineCursos()
        }
        return this._cursos;
    }

    periodos() {
        if (this._periodos == undefined) {
            this._periodos = this.definePeriodos()
        }
        return this._periodos;
    }


    defineEscuelas() {
        return new DemoTable({ tableName: "escuelas", tenant: this.tenant }).rows([
            { nombre: "Carlos Pellegrini" },
            { nombre: "Nacional Buenos Aires" },
            { nombre: "Mariano Acosta" },
        ]);
    }

    defineModalidades() {
        return new DemoTable({ tableName: "modalidades", tenant: this.tenant }).rows([
            { nombre: "Sociales" },
            { nombre: "Economía" }
        ]);
    }

    defineMaterias() {
        return new DemoTable({ tableName: "materias", tenant: this.tenant }).rows([
            { nombre: "Matemática" },
            { nombre: "Física" },
            { nombre: "Química" },
            { nombre: "Informática" }
        ]);
    }

    defineCursos() {
        return new DemoTable({ tableName: "cursos", tenant: this.tenant }).rows([
            { añolectivo: Dates.ThisYear(), escuela: this.escuelas().id(1), modalidad: this.modalidades().id(1), año: 1, turno: "M", division: "B" },
            { añolectivo: Dates.ThisYear(), escuela: this.escuelas().id(2), modalidad: this.modalidades().id(2), año: 3, turno: "M", division: "A" }
        ])
    }

    definePeriodos() {
        return new DemoTable({ tableName: "cursos", tenant: this.tenant }).rows([
            {
                añolectivo: Dates.ThisYear(),
                nombre: "Primer Cuatrimestre",
                desde: Dates.From(Dates.ThisYear() + "/03/10"),
                hasta: Dates.From(Dates.ThisYear() + "/06/28"),
                preliminar: Dates.From(Dates.ThisYear() + "/04/25")
            },
            {
                añolectivo: Dates.ThisYear(),
                nombre: "Segundo Cuatrimestre",
                desde: Dates.From(Dates.ThisYear() + "/07/05"),
                hasta: Dates.From(Dates.ThisYear() + "/20/11"),
            },
        ])
    }


}

class DemoTable {

    constructor(parameters) {
        this.tableName = parameters.tableName;
        this.tenant = parameters.tenant;
    }

    rows(rows) {
        this.rows = rows;
        return this;
    }

    sqls() {
        if (this._sqls == undefined) {
            this._sqls = this.defineSqls()
        }
        return this._sqls;
    }

    defineSqls() {
        const sqls = new Sqls();
        for (const row of this.rows) {
            sqls.add(
                new SqlInsert({
                    tableName: this.tableName,
                    values: this.transformRow(row),
                })
            );
        }
        return sqls.text();
    }

    transformRow(row) {
        if (Utils.IsNotDefined(row.id)) {
            row.id = Strings.NewGuid();
            row.tenant = this.tenant;
        }
        return row;
    }

    id(n) {
        return this.rows[n - 1].id
    }

}


module.exports.DemoGenerate = DemoGenerate;