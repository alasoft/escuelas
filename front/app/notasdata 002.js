class NotasData {

    refresh(parameters) {
        this.initRefresh(parameters)
            .then(() =>
                this.loadValoraciones())
            .then(() =>
                this.refreshPeriodos())

    }

    initRefresh(parameters = {}) {
        let init = this.initMateriaCurso(parameters.materiaCurso);
        if (init == undefined) {
            init = this.initCurso(parameters.curso);
        }
        if (init == undefined) {
            init = this.initAñoLectivo(parameters.añoLectivo)
        }
        if (init == undefined) {
            init = Promise.resolve(true);
        }
        return init;
    }

    initMateriaCurso(materiaCurso) {
        if (materiaCurso != undefined) {
            if (materiaCurso != this.materiaCurso) {
                if (materiaCurso != null) {
                    return new Rest({ path: "materias_cursos" }).promise({
                            verb: "get",
                            data: {
                                id: materiaCurso,
                                full: true
                            }
                        })
                        .then(row => {
                            if (row != undefined) {
                                this.añoLectivo = row.añoLectivo;
                                this.curso = row.curso;
                                this.materiaCurso = row.id;
                            } else {
                                this.clearInit();
                            }
                        })

                } else {
                    this.clearInit()
                }
            }
        }
    }

    clearInit() {
        this.añoLectivo = undefined;
        this.curso = undefined;
        this.materiaCurso = undefined
    }

    initCurso(curso) {
        if (curso != undefined) {
            if (curso != this.cursoAnterior) {
                if (curso != null) {
                    return new Rest({ path: "cursos" }).promise({
                            verb: "get",
                            data: {
                                id: curso,
                                full: true
                            }
                        })
                        .then(row => {
                            if (row != undefined) {
                                this.añoLectivo = row.añoLectivo;
                                this.curso = row.id;
                                this.materiaCurso = undefined;
                            } else {
                                this.clearInit();
                            }
                        })
                } else {
                    this.clearInit();
                }
                return Promise.resolve(true)
            }
        }
    }

    initAñoLectivo(añoLectivo) {
        if (añoLectivo != undefined) {
            if (añoLectivo != null) {
                if (añoLectivo != this.añoLectivoAnterior) {
                    if (añoLectivo <= Dates.ThisYear()) {
                        this.añoLectivo = añoLectivo;
                        this.curso = undefined;
                        this.materiaCurso = undefined;
                        return Promise.resolve(true)
                    }
                }
            } else {
                this.clearInit()
            }
        }
    }

    refreshPeriodos() {
        if (this.añoLectivo != this.añoLectivoAnterior) {
            if (Utils.IsDefined(this.añoLectivo)) {
                return new Rest({ path: "periodos" })
                    .promise({
                        verb: "list",
                        data: { añolectivo: this.añoLectivo }
                    })
                    .then(rows =>
                        this.periodosRows = rows)
            } else {
                this.periodosRows = []
            }
        }
    }

    refreshAlumnos() {
        if (this.curso != this.cursoAnterior) {
            if (Utils.IsDefined(this.curso)) {
                return new Rest({ path: "alumnos" })
                    .promise({
                        verb: "list",
                        data: { curso: this.curso }
                    })
                    .then(rows =>
                        this.alumnosRows = rows)
            } else {
                this.alumnosRows = []
            }
        }
    }

    refreshNotas() {
        if (this.materiaCurso != this.materiaCursoAnterior) {
            if (Utils.IsDefined(this.materiaCurso)) {
                return new Rest({ path: "notas" })
                    .promise({
                        verb: "list",
                        data: { curso: this.curso }
                    })
                    .then(rows =>
                        this.notasRows = rows)
            } else {
                this.notasRows = []
            }
        }
    }

    refreshTps() {
        if (this.materiaCurso != this.materiaCursoAnterior) {
            if (Utils.IsDefined(this.materiaCurso)) {
                return new Rest({ path: "tps" })
                    .promise({
                        verb: "list",
                        data: { curso: this.curso }
                    })
                    .then(rows =>
                        this.tpsRows = rows)
            } else {
                this.tpsRows = []
            }
        }
    }

    planilla() {
        if (this._planilla == undefined) {
            this._planilla = this.definePlanilla();
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
        return 0 < cantidad ? Math.round(suma / cantidad) : undefined;
    }

    promedioFinal(promedios) {
        let suma = 0;
        let cantidad = 0;
        Object.keys(promedios).forEach((key, i) => {
            const promedio = promedios[key].promedio;
            if (promedio != undefined) {
                suma += promedios[key].promedio;
                cantidad += 1;
            }
        })
        const promedioFinal = 0 < cantidad ? Math.round(suma / cantidad) : undefined;
        const valoracionFinal = valoracion(promedioFinal);
        return { promedio: promedioFinal, valoracion: valoracionFinal };
    }

    valoracion(promedio) {
        if (promedio != undefined) {
            for (const row of this.valoracionesRows) {
                if (row.desde <= promedio && promedio <= row.hasta) {
                    return row.sigla
                }
            }
        }
    }

}