const { Sqls } = require("../sql/sql");
const { SqlInsert } = require("../sql/sqloperations");
const { Utils, Strings, Dates } = require("./utils");

class DemoGenerate {

    constructor(parameters) {
        this.db = parameters.db;
        this.tenant = parameters.tenant;
        this.añoLectivo = Dates.ThisYear();
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
                this.alumnosUno().sqls(),
                this.alumnosDos().sqls(),
                this.materiasUno().sqls(),
                this.materiasDos().sqls(),
                this.valoraciones().sqls(),
                this.periodos().sqls()
            ])

    }

    escuelas() {
        if (this._escuelas == undefined) {
            this._escuelas = this.defineEscuelas()
        }
        return this._escuelas;
    }

    alumnosUno() {
        if (this._alumnosUno == undefined) {
            this._alumnosUno = this.defineAlumnosUno();
        }
        return this._alumnosUno;
    }

    alumnosDos() {
        if (this._alumnosDos == undefined) {
            this._alumnosDos = this.defineAlumnosDos();
        }
        return this._alumnosDos;
    }

    materiasUno() {
        if (this._materiasUno == undefined) {
            this._materiasUno = this.defineMateriasUno();
        }
        return this._materiasUno;
    }

    materiasDos() {
        if (this._materiasDos == undefined) {
            this._materiasDos = this.defineMateriasDos();
        }
        return this._materiasDos;
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

    valoraciones() {
        if (this._valoraciones == undefined) {
            this._valoraciones = this.defineValoraciones();
        }
        return this._valoraciones;
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

    defineAlumnosUno() {
        return new DemoTable({
            tableName: "alumnos", tenant: this.tenant,
            masterData: { curso: this.cursos().id(1) }
        }).rows(
            [{ apellido: "Gomez", nombre: "Juan Alberto" },
            { apellido: "Perez", nombre: "Ernesto" },
            { apellido: "Ramirez", nombre: "Johnatan Jose" },
            { apellido: "Lopez", nombre: "Maria Angelica" },
            { apellido: "Achabal", nombre: "Anabel Josefa" },
            { apellido: "Romario", nombre: "Ester Patricia" },
            { apellido: "Marin", nombre: "Jose Ernesto" },
            ])
    }

    defineAlumnosDos() {
        return new DemoTable({
            tableName: "alumnos", tenant: this.tenant,
            masterData: { curso: this.cursos().id(2) }
        }).rows(
            [
                { apellido: "Romualdo", nombre: "Jose Antonio" },
                { apellido: "Blanco", nombre: "Maria Josefa" },
                { apellido: "Yorio", nombre: "Alberto Ramiro" },
                { apellido: "Zanetti", nombre: "Jose" },
                { apellido: "Basualdo", nombre: "Marta Elena" },
                { apellido: "Rinaldi", nombre: "Estela Patricia" },
                { apellido: "Albertini", nombre: "Jose" },
            ])
    }

    defineMateriasUno() {
        return new DemoTable({
            tableName: "materias_cursos", tenant: this.tenant,
            masterData: { curso: this.cursos().id(1) }
        }).rows(
            [
                { materia: this.materias().id(1) },
                { materia: this.materias().id(2) },
            ])
    }

    defineMateriasDos() {
        return new DemoTable({
            tableName: "materias_cursos", tenant: this.tenant,
            masterData: { curso: this.cursos().id(2) }
        }).rows(
            [
                { materia: this.materias().id(1) },
                { materia: this.materias().id(3) },
                { materia: this.materias().id(4) },
            ])
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
            { añolectivo: this.añoLectivo, escuela: this.escuelas().id(1), modalidad: this.modalidades().id(1), año: 1, turno: "M", division: "B" },
            { añolectivo: this.añoLectivo, escuela: this.escuelas().id(2), modalidad: this.modalidades().id(2), año: 3, turno: "M", division: "A" }
        ])
    }

    defineValoraciones() {
        return new DemoTable({ tableName: "valoraciones", tenant: this.tenant }).rows([
            { añolectivo: this.añoLectivo, nombre: "Desaprobado", sigla: "TEP", desde: 1, hasta: 6 },
            { añolectivo: this.añoLectivo, nombre: "Aprobado", sigla: "TEA", desde: 7, hasta: 10 },
        ])
    }

    definePeriodos() {
        return new DemoTable({ tableName: "periodos", tenant: this.tenant }).rows([
            {
                añolectivo: this.añoLectivo,
                nombre: "Primer Cuatrimestre",
                desde: this.añoLectivo + "/03/10",
                hasta: this.añoLectivo + "/06/28",
                preliminar: this.añoLectivo + "/04/25"
            },
            {
                añolectivo: Dates.ThisYear(),
                nombre: "Segundo Cuatrimestre",
                desde: this.añoLectivo + "/07/05",
                hasta: this.añoLectivo + "/11/20",
            },
        ])
    }


}

class DemoTable {

    constructor(parameters) {
        this.tableName = parameters.tableName;
        this.tenant = parameters.tenant;
        this.masterData = parameters.masterData;
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
        }
        row.tenant = this.tenant;
        if (Utils.IsDefined(this.masterData)) {
            row = Object.assign({}, row, this.masterData)
        }
        return row;
    }

    id(n) {
        return this.rows[n - 1].id
    }

}

module.exports.DemoGenerate = DemoGenerate;