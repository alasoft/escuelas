class NotasExamenes extends NotasBase {

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
                        selectTextOnEditStart: true
                    }
                }
            }
        }
    }

    columns() {
        return new NotasExamenesColumns(this).columns()
    }

    rows() {
        return new NotasExamenesRows(this).rows()
    }

    listOnCellPrepared(e) {
        if (e.column.isNota == true && [Dates.PASADO, Dates.PRESENTE].includes(e.column.temporalidad)) {
            e.cellElement.css(this.class().COLOR_PRESENTE)
        } else if (e.column.temporalidad == Dates.FUTURO) {
            e.cellElement.css(this.class().COLOR_FUTURO)
        } else if (e.column.esAnual == true) {
            e.cellElement.css(this.class().COLOR_ANUAL)
        }
    }

}

class NotasExamenesColumns extends NotasColumnsBase {

    periodoColumns(periodoRow) {
        return [
            this.grupoExamenes(periodoRow),
            this.grupoPromedioValoracion({
                periodoRow: periodoRow,
                name: "preliminar",
                width: 80,
                headerTemplate: "Informe Preliminar" + "<small><br>" + (Utils.IsDefined(periodoRow.preliminar) ? Dates.Format(periodoRow.preliminar) : "<i>(fecha no definida)"),
                caption: "Informe Preliminar"
            }),
            this.grupoPromedioValoracion({
                periodoRow: periodoRow,
                name: "promedio",
                width: 80,
                caption: periodoRow.temporalidad == Dates.PASADO ? "Final" : "Proyectado",
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
        const columns = [];
        for (const examenRow of this.examenesRows) {
            if (examenRow.periodo == periodoRow.id) {
                columns.push({
                    dataField: "examen_" + examenRow.id,
                    caption: examenRow.nombre,
                    temporalidad: examenRow.temporalidad,
                    isNota: true,
                    editCellTemplate: NotasBase.NotaEditor,
                    width: 100,
                    allowReordering: false,
                    allowResizing: true,
                })
            }
        }
        return columns.concat(this.emptyColumn(periodoRow));
    }

}

class NotasExamenesRows extends NotasRowsBase {

    rows() {
        const rows = [];
        for (const alumnoRow of this.alumnosRows) {
            const alumno = { id: alumnoRow.id, apellido: alumnoRow.apellido, nombre: alumnoRow.nombre };
            const notas = this.notasData.alumnoNotas(alumnoRow.id)
            const preliminares = this.notasData.alumnoPreliminares(alumnoRow.id)
            const promedios = this.notasData.alumnoPromedios(alumnoRow.id);
            const anual = this.notasData.promedioTotal(promedios)
            rows.push(Object.assign({}, alumno, notas, preliminares, promedios, anual))
        }
        return rows;
    }

}