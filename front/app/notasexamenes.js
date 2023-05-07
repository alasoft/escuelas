class NotasExamenes extends NotasBase {

    constructor(parameters) {
        super(parameters);
        this.notasView = parameters.notasView;
    }

    static COLOR_NOTA_EDITABLE = {
        "background-color": "rgb(200, 245, 220)"
    }

    static COLOR_PRESENTE = {
        "background-color": "rgb(209, 249, 250)"
    }

    static COLOR_FUTURO = {
        "background-color": "rgb(245, 248, 249)"
    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Notas por Examen",
                fullScreen: true
            },
            components: {
                list: {
                    editing: {
                        mode: "cell",
                        allowUpdating: true,
                        startEditAction: "click",
                        selectTextOnEditStart: true,
                    },
                    onRowUpdating: e => this.listOnRowUpdating(e),
                }
            }
        }
    }

    notasData() {
        if (this.notasView != undefined) {
            return this.notasView.notasData()
        } else {
            return super.notasData()
        }
    }

    columns() {
        return new NotasExamenesColumns(this).columns()
    }

    rows() {
        return new NotasExamenesRows(this).rows()
    }

    listOnRowUpdating(e) {
        const parameters = this.saveNotaParameters(e)
        this.notasData().saveNota(parameters.examen, this.alumno(), parameters.nota)
        e.newData = this.notasData().alumnoTotalesRow(this.alumno(), true)
        this.saveNota(parameters);
    }

    saveNotaParameters(e) {
        const notaProperty = Object.keys(e.newData)[0];
        const nota = e.newData[notaProperty];
        const notaAnterior = e.oldData[notaProperty];
        const examen = Strings.After(notaProperty, "_");
        return { alumno: this.alumno(), examen, nota, notaAnterior };
    }

    saveNota(p) {
        new Rest({ path: "notas" }).promise({
                verb: "update",
                data: {
                    examen: p.examen,
                    alumno: p.alumno,
                    nota: p.nota
                }
            })
            .then(() =>
                this.dataHasChanged = true)
            .catch(err =>
                this.saveNotaHandleError(err, p))
    }

    setState(state) {
        if (this.notasView != undefined) {
            this.state.filter.añoLectivo = this.notasView.añoLectivo();
            this.state.filter.curso = this.notasView.curso();
            this.state.filter.materiaCurso = this.notasView.materiaCurso();
        }
        super.setState(state);
    }

    listOnCellPrepared(e) {
        if (e.column.isNota == true && Dates.NoEsFuturo(e.column.subTemporalidad)) {
            e.cellElement.css(this.class().COLOR_NOTA_EDITABLE)
        } else if (e.column.temporalidad == Dates.PRESENTE) {
            e.cellElement.css(this.class().COLOR_PRESENTE)
        } else if (e.column.temporalidad == Dates.FUTURO) {
            e.cellElement.css(this.class().COLOR_FUTURO)
        } else if (e.column.esAnual == true) {
            e.cellElement.css(this.class().COLOR_ANUAL)
        }
    }

}

class NotasExamenesColumns extends NotasColumnsBase {

    periodoVisible(periodoRow) {
        const visible = Dates.NoEsFuturo(periodoRow.temporalidad) || 0 < periodoRow.examenesCantidad;
        return visible;
    }

    periodoColumns(periodoRow) {
        return [
            this.grupoExamenes(periodoRow),
            this.grupoPromedioValoracion({
                periodoRow: periodoRow,
                name: "preliminar",
                headerTemplate: "Informe Preliminar" + "<small><br>" + (Utils.IsDefined(periodoRow.preliminar) ? Dates.Format(periodoRow.preliminar) : "<i>(fecha no definida)"),
                caption: "Informe Preliminar",
                visible: Dates.NoEsFuturo(periodoRow.temporalidad)
            }),
            this.grupoPromedioValoracion({
                periodoRow: periodoRow,
                name: "promedio",
                caption: periodoRow.temporalidad == Dates.PASADO ? "Final" : "Proyectado",
                visible: Dates.NoEsFuturo(periodoRow.temporalidad)
            })
        ]
    }

    grupoExamenes(periodoRow) {
        return {
            name: "examenes_" + periodoRow.id,
            caption: "Examenes",
            temporalidad: periodoRow.temporalidad,
            alignment: "center",
            columns: this.examenesColumns(periodoRow)
        }
    }

    examenesColumns(periodoRow) {
        let columns = [];
        for (const examenRow of this.examenesRows) {
            if (examenRow.periodo == periodoRow.id) {
                columns.push({
                    dataField: "examen_" + examenRow.id,
                    caption: examenRow.nombre,
                    alignment: "center",
                    isNota: true,
                    allowEditing: Dates.NoEsFuturo(examenRow.temporalidad),
                    temporalidad: periodoRow.temporalidad,
                    subTemporalidad: examenRow.temporalidad,
                    editCellTemplate: NotasBase.NotaEditor,
                    width: 100,
                    allowReordering: false,
                    allowResizing: true,
                })
            }
        }
        if (periodoRow.examenesCantidad == 1 && periodoRow.temporalidad == Dates.FUTURO) {
            columns = columns.concat(this.emptyColumn(periodoRow, 80));
        }
        return columns;
    }

}

class NotasExamenesRows extends NotasRowsBase {

    constructor(notas) {
        super(notas);
        this.includeNotas = true;
    }

}