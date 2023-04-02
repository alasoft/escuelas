class NotasData {

    refresh(parameters) {
        return this.initRefresh(parameters)
            .then(() =>
                this.loadValoraciones())
            .then(() =>
                this.refreshPeriodos())
            .then(() =>
                this.refreshAlumnos())
            .then(() =>
                this.refreshNotas())
            .then(() =>
                this.refreshTps())
            .then(() =>
                this.endRefresh())
    }

    initRefresh(parameters = {}) {}

    initFromMateriaCurso(materiaCurso) {
        if (materiaCurso != undefined) {
            if (materiaCurso == null) {
                this.blankInit()
            }
        }
    }

    blankInit() {
        this.añoLectivo = undefined;
        this.curso = undefined;
        this.materiaCurso = undefined
    }

    initFromCurso(curso) {
        if (curso != this.curso) {
            return new Rest({ path: "cursos" })
                .promise({
                    verb: "get",
                    data: {
                        id: curso,
                        full: true
                    }
                })
                .then(row => {
                    this.añoLectivo = row.añolectivo;
                    this.curso = row.curso;
                    this.materiaCurso = undefined;
                })
        } else {
            return Promise.resolve(true)
        }
    }

    initFromAñoLectivo(añoLectivo) {
        if (añoLectivo != this.añoLectivoAnterior) {

        }
    }

    loadValoraciones() {
        if (this.valoracionesRows == undefined) {
            return new Rest({ path: "valoraciones" })
                .promise({ verb: "list" })
                .then(rows =>
                    this.valoracionesRows = rows)
        }
    }

    refreshPeriodos() {
        if (Utils.IsDefined(this.añoLectivo)) {
            if (this.añoLectivo != this.añoLectivoAnterior) {
                return new Rest({ path: "periodos" })
                    .promise({
                        verb: "list",
                        data: { añolectivo: this.añoLectivo }
                    })
                    .then(rows =>
                        this.periodosRows = rows)
            }
        } else {
            this.periodosRows = []
        }
    }

    refreshAlumnos() {
        if (Utils.IsDefined(this.curso)) {
            if (this.curso != this.cursoAnterior) {
                return new Rest({ path: "alumnos" })
                    .promise({
                        verb: "list",
                        data: { curso: this.curso }
                    })
                    .then(rows =>
                        this.alumnosRows = rows)
            }
        } else {
            this.alumnosRows = []
        }
    }

    refreshNotas() {
        if (Utils.IsDefined(this.materiaCurso)) {
            if (this.materiaCurso != this.materiaCursoAnterior) {
                return new Rest({ path: "notas" })
                    .promise({
                        verb: "list",
                        data: { curso: this.curso }
                    })
                    .then(rows =>
                        this.notasRows = rows)
            }
        } else {
            this.notasRows = []
        }
    }

    refreshTps() {
        if (Utils.IsDefined(this.materiaCurso)) {
            if (this.materiaCurso != this.materiaCursoAnterior) {
                return new Rest({ path: "tps" })
                    .promise({
                        verb: "list",
                        data: { curso: this.curso }
                    })
                    .then(rows =>
                        this.tpsRows = rows)
            }
        } else {
            this.tpsRows = []
        }
    }

    endRefresh() {
        this.añoLectivoAnterior = this.añoLectivo;
        this.cursoAnterior = this.curso;
        this.materiaCursoAnterior = this.materiaCurso;
    }

    getNotasRow(alumno, tp) {
        for (const row of this.notasRows) {
            if (row.alumno == alumno && row.tp == tp) {
                return row
            }
        }
    }

    getNota(alumno, tp) {
        const row = this.getNotasRow(alumno, tp);
        if (row != undefined) {
            return row.nota
        }
    }

    planilla(parameters) {
        if (parameters != undefined) {
            this.refresh(parameters);
        }
        if (this._planilla == undefined) {
            this._planilla = this.definePlanilla()
        }
        return this._planilla;
    }

    definePlanilla() {
        const planilla = [];
        for (const row of this.alumnosRows) {
            const alumno = { id: row.id, apellido: row.apellido, nombre: row.nombre };
            const promedios = this.alumnoPromedios(row.id)
            const final = this.promedioFinal(promedios)
            planilla.push(Object.assign({}, alumno, promedios, final))
        }
        return planilla;
    }

    alumnoPromedios(alumno) {
        const promedios = {};
        for (const row of this.periodosRows) {
            const promedio = this.alumnoPromedio(alumno, row.id);
            const valoracion = this.valoracion(promedio);
            promedios[row.id] = { promedio: promedio, valoracion: valoracion }
        }
        return promedios;
    }

    alumnoPromedio(alumno, periodo) {
        let suma = 0;
        let cantidad = 0;
        for (const row of this.notasRows) {
            if (row.alumno == alumno && row.periodo == periodo) {
                suma += row.nota;
                cantidad += 1;
            }
        }
        return 0 < cantidad ? Math.round(suma / cantidad) : 0;
    }

    valoracion(promedio) {
        for (const row of this.valoracionesRows) {
            if (row.desde <= promedio && promedio <= row.hasta) {
                return row.sigla
            }
        }
    }

    promedioFinal(promedios) {
        let suma = 0;
        let cantidad = 0;
        Object.keys(promedios).forEach((key, i) => {
            suma += promedios[key].promedio;
            cantidad += 1;
        })
        return Math.round(suma / cantidad)
    }

}