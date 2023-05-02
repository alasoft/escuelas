class NotasData {

    refresh(materiaCurso) {
        if (Utils.IsDefined(materiaCurso)) {
            return new Rest({ path: "notas_data" })
                .promise({
                    verb: "list",
                    data: {
                        materiacurso: materiaCurso
                    }
                })
                .then(data =>
                    this.setData(data))
                .then(() =>
                    this.setExamenesData())
                .then(() =>
                    this.setPeriodosData())
        } else {
            this.setData(this.emptyData());
            return Promise.resolve()
        }
    }

    setData(data) {
        this.valoracionesRows = data.valoracionesRows;
        this.periodosRows = data.periodosRows;
        this.alumnosRows = data.alumnosRows;
        this.notasRows = data.notasRows;
        this.examenesRows = data.examenesRows;
    }

    emptyData() {
        return {
            valoracionesRows: [],
            periodosRows: [],
            alumnosRows: [],
            examenesRows: [],
            notasRows: []
        }
    }

    setExamenesData() {
        for (const row of this.examenesRows) {
            row.desde = new Date(row.desde);
            row.hasta = new Date(row.hasta);
            row.temporalidad = Dates.Temporalidad(row.desde, row.hasta)
        }
    }

    setPeriodosData() {
        for (const row of this.periodosRows) {
            row.examenesCantidad = this.examenesCantidadPorPeriodo(row.id);
            row.desde = new Date(row.desde);
            row.hasta = new Date(row.hasta);
            row.preliminar = Utils.IsDefined(row.preliminar) ? new Date(row.preliminar) : undefined;
            row.temporalidad = Dates.Temporalidad(row.desde, row.hasta)
        }
    }

    examenesCantidadPorPeriodo(periodo) {
        let cantidad = 0
        for (const row of this.examenesRows) {
            if (row.periodo == periodo) {
                ++cantidad;
            }
        }
        return cantidad;
    }

    hayPeriodos() {
        return 0 < this.periodosRows.length
    }

    getLastPeriodo() {
        if (this.hayPeriodos()) {
            return this.periodosRows[this.periodosRows.length - 1];
        }
    }

    alumnoPromedioAnual(alumno) {
        return this.promedioTotal(this.alumnoPromedios(alumno))
    }

    alumnoPreliminares(alumno) {
        const preliminares = {}
        for (const row of this.periodosRows) {
            const preliminar = this.alumnoPreliminarPeriodo(alumno, row.id);
            preliminares["preliminar_" + row.id] = preliminar;
        }
        return preliminares;
    }

    alumnoPreliminarPeriodo(alumno, periodo) {
        const periodoRow = this.getPeriodoRow(periodo)
        if (!Utils.IsDefined(periodoRow.preliminar)) {
            return {};
        }
        let suma = 0;
        let cantidad = 0;
        for (const row of this.notasRows) {
            if (row.alumno == alumno && row.periodo == periodo) {
                const examenRow = this.getExamenRow(row.examen);
                if (examenRow.hasta <= periodoRow.preliminar) {
                    suma += row.nota;
                    ++cantidad;
                }
            }
        }
        return this.promedioValoracion(suma, cantidad);
    }

    alumnoPromedios(alumno) {
        const promedios = {};
        for (const row of this.periodosRows) {
            const promedio = this.alumnoPromedioPeriodo(alumno, row.id);
            promedios["promedio_" + row.id] = promedio;
        }
        return promedios;
    }

    alumnoPromedioPeriodo(alumno, periodo) {
        let suma = 0;
        let cantidad = 0;
        for (const row of this.notasRows) {
            if (row.alumno == alumno && row.periodo == periodo && Utils.IsDefined(row.nota)) {
                suma += row.nota;
                ++cantidad;
            }
        }
        return this.promedioValoracion(suma, cantidad);
    }

    promedioValoracion(suma, cantidad) {
        const promedio = 0 < cantidad ? Math.round(suma / cantidad) : undefined;
        const valoracion = this.valoracion(promedio);
        return {
            suma: suma,
            cantidad: cantidad,
            promedio: promedio,
            valoracion: valoracion,
        }
    }

    alumnoStatus(alumno, promedios) {
        const status = {};
        for (const row of this.periodosRows) {
            const statusPeriodo = this.alumnoStatusPeriodo(alumno, row, promedios["promedio_" + row.id]);
            status["status_" + row.id] = { descripcion: statusPeriodo };
        }
        return status;
    }

    alumnoStatusPeriodo(alumno, periodoRow, promedio) {
        const examenesCantidad = periodoRow.examenesCantidad;
        const cantidad = promedio.cantidad;
        if (periodoRow.temporalidad == Dates.FUTURO) {
            return ""
        }
        if (this.examenesRows.length == 0) {
            return "No hay exámenes cargados"
        }
        if (cantidad < examenesCantidad) {
            const diferencia = (examenesCantidad - cantidad);
            if (1 < diferencia) {
                return "Faltan cargar " + (examenesCantidad - cantidad) + " notas";
            } else {
                return "Falta cargar " + diferencia + " nota";
            }
        }
        if (periodoRow.temporalidad = Dates.PASADO) {
            return "Completo"
        } {
            return "Notas al dia"
        }
    }

    promedioTotal(promedios) {
        let suma = 0;
        let cantidad = 0;
        Object.keys(promedios).forEach((key, i) => {
            const promedio = promedios[key].promedio;
            if (promedio != undefined) {
                suma += promedios[key].promedio;
                cantidad += 1;
            }
        })
        const promedioTotal = 0 < cantidad ? Math.round(suma / cantidad) : undefined;
        const valoracionTotal = this.valoracion(promedioTotal);
        return { total: { promedio: promedioTotal, valoracion: valoracionTotal } };
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

    getPeriodoPresenteRow() {
        for (const row of this.periodosRows) {
            if (row.temporalidad = Dates.PRESENTE) {
                return row;
            }
        }
    }

    getNota(examen, alumno) {
        const row = this.getNotasRow(examen, alumno);
        if (row != undefined) {
            return row.nota
        }
    }

    saveNota(examen, alumno, nota) {
        const row = this.getNotasRow(examen, alumno);
        if (row != undefined) {
            if (Utils.IsDefined(nota)) {
                row.nota = nota
            } else {
                this.notasRows = this.notasRows.filter(row =>
                    !(row.examen == examen && row.alumno == alumno))
            }
        } else {
            if (Utils.IsDefined(nota)) {
                this.notasRows.push({
                    examen: examen,
                    alumno: alumno,
                    nota: nota,
                    periodo: this.getExamenRow(examen).periodo
                })
            }
        }
        return Promise.resolve()
    }

    getAlumnoRow(id) {
        for (const row of this.alumnosRows) {
            if (row.id == id) {
                return row;
            }
        }
    }

    getPeriodoRow(id) {
        for (const row of this.periodosRows) {
            if (row.id == id) {
                return row;
            }
        }
    }

    getPeriodoRowByName(nombre) {
        for (const row of this.periodosRows) {
            if (Strings.EqualsIgnoreCase(row.nombre, nombre)) {
                return row;
            }
        }
    }

    getExamenRow(id) {
        for (const row of this.examenesRows) {
            if (row.id == id) {
                return row;
            }
        }
    }

    getNotasRow(examen, alumno) {
        for (const row of this.notasRows) {
            if (row.examen == examen && row.alumno == alumno) {
                return row
            }
        }
    }

    hayNotas() {
        return 0 < this.notasRows.length;
    }

    hayNotasAlumno(alumno) {
        for (const row of this.notasRows) {
            if (row.alumno == alumno && Utils.IsDefined(row.nota)) {
                return true;
            }
        }
        return false
    }

}