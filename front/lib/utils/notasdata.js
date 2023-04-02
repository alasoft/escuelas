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
                    this.setPeriodosData())
        } else {
            this.cleanData();
            return Promise.resolve()
        }
    }

    setData(data) {
        const rows = data.rows;
        this.valoracionesRows = rows.valoraciones;
        this.periodosRows = rows.periodos;
        this.alumnosRows = rows.alumnos;
        this.notasRows = rows.notas;
        this.tpsRows = rows.tps;
        this._planillaRows = undefined;
    }

    cleanData() {
        this.valoraciones = [];
        this.periodos = [];
        this.alumnos = [];
        this.notas = [];
        this.tps = [];
        this._planillaRows = undefined;
    }

    setPeriodosData() {
        for (const row of this.periodosRows) {
            row.tpsCantidad = this.tpsCantidadPorPeriodo(row.id);
            row.desde = new Date(row.desde);
            row.hasta = new Date(row.hasta);
            row.pasado = row.hasta < Dates.Today()
            row.presente = Dates.Between(Dates.Today(), row.desde, row.hasta)
            row.futuro = Dates.Today() < row.desde
        }
    }

    tpsCantidadPorPeriodo(periodo) {
        let cantidad = 0
        for (const row of this.tpsRows) {
            if (row.periodo == periodo) {
                ++cantidad;
            }
        }
        return cantidad;
    }

    planillaRows() {
        if (this._planillaRows == undefined) {
            this._planillaRows = this.definePlanillaRows();
        }
        return this._planillaRows;
    }

    planillaColumns() {
        const columnas = [{
                dataField: "id",
                visible: false
            },
            { dataField: "apellido", width: 150 },
            { dataField: "nombre", width: 150 }
        ]
        for (const row of this.periodosRows) {
            columnas.push({
                dataField: "periodo_" + row.id,
                caption: row.nombre,
                calculateCellValue: r => row.presente ? r["periodo_" + row.id].promedio : "",
                futuro: row.futuro,
                width: 150
            });
            columnas.push({
                dataField: "periodo_status_" + row.id,
                caption: "Status",
                calculateCellValue: r => row.presente ? r["periodo_" + row.id].status : "",
                visible: row.presente,
                width: 150
            })
        }
        columnas.push({
            dataField: "anual",
            calculateCellValue: r => this.getLastPeriodo().pasado ? r["anual"].promedio : "",
            futuro: this.getLastPeriodo().futuro,
            width: 150
        })
        return columnas;
    }

    cellAnualDisplay(value) {
        if (this.getLastPeriodo().pasado) {
            return value;
        } else {
            return "";
        }
    }

    getLastPeriodo() {
        return this.periodosRows[this.periodosRows.length - 1];
    }

    definePlanillaRows() {
        const rows = [];
        for (const row of this.alumnosRows) {
            const alumno = { id: row.id, apellido: row.apellido, nombre: row.nombre };
            const promedios = this.alumnoPromedios(row.id)
            const anual = this.promedioAnual(promedios)
            rows.push(Object.assign({}, alumno, promedios, anual))
        }
        return rows;
    }

    alumnoPromedios(alumno) {
        const promedios = {};
        for (const row of this.periodosRows) {
            const promedio = this.alumnoPromedio(alumno, row.id);
            promedios["periodo_" + row.id] = promedio;
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
        const promedio = 0 < cantidad ? Math.round(suma / cantidad) : undefined;
        const valoracion = this.valoracion(promedio);
        return {
            promedio: promedio,
            valoracion: valoracion,
            status: this.alumnoStatus(periodo, cantidad)
        }
    }

    alumnoStatus(periodo, cantidad) {
        const tpsCantidad = this.getPeriodo(periodo).tpsCantidad;
        if (cantidad == 0) {
            return "No hay notas"
        }
        if (cantidad < tpsCantidad) {
            const diferencia = (tpsCantidad - cantidad);
            if (1 < diferencia) {
                return "Faltan cargar " + (tpsCantidad - cantidad) + " notas";
            } else {
                return "Falta cargar " + diferencia + " nota";
            }
        }
        return "Completo"
    }

    alumnoStatusPresente(alumno) {
        const periodoPresente = this.getPeriodoPresente()
        return this.getAlumnoFromPlanilla(alumno)["periodo_" + periodoPresente.id].status;
    }

    getAlumnoFromPlanilla(id) {
        for (const row of this.planillaRows()) {
            if (row.id == id) {
                return row;
            }
        }
    }

    getPeriodo(id) {
        for (const row of this.periodosRows) {
            if (row.id == id) {
                return row;
            }
        }
    }

    getPeriodoPresente() {
        for (const row of this.periodosRows) {
            if (row.presente == true) {
                return row;
            }
        }
    }

    promedioAnual(promedios) {
        let suma = 0;
        let cantidad = 0;
        Object.keys(promedios).forEach((key, i) => {
            const promedio = promedios[key].promedio;
            if (promedio != undefined) {
                suma += promedios[key].promedio;
                cantidad += 1;
            }
        })
        const promedioAnual = 0 < cantidad ? Math.round(suma / cantidad) : undefined;
        const valoracionAnual = this.valoracion(promedioAnual);
        return { anual: { promedio: promedioAnual, valoracion: valoracionAnual } };
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

    alumnoRows(alumno) {
        const rows = []
        for (const row of this.tpsRows) {
            rows.push({
                id: row.id,
                nombre: row.nombre,
                desde: row.desde,
                hasta: row.hasta,
                periodo: row.periodo,
                periodoNombre: row.periodonombre,
                nota: this.getNota(alumno, row.id),
                futuro: this.getPeriodo(row.periodo).futuro
            })
        }
        return rows;
    }

    getNota(alumno, tp) {
        const row = this.getNotasRow(alumno, tp);
        if (row != undefined) {
            return row.nota
        }
    }

    getNotasRow(alumno, tp) {
        for (const row of this.notasRows) {
            if (row.alumno == alumno && row.tp == tp) {
                return row
            }
        }
    }

}