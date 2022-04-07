class Evaluaciones extends CursosMateriasDetalle {

    extraConfiguration() {
        return {
            mode: "view",
            components: {
                filter: {
                    width: 1150,
                    height: 100
                },
                list: {
                    key: "id",
                    //                    focusedRowEnabled: false,
                    columns: this.fixedColumns(),
                    wordWrapEnabled: true,
                    editing: {
                        mode: "cell",
                        allowUpdating: true,
                        selectTextOnEditStart: true,
                        startEditAction: "dblClick"
                    },
                    columnFixing: {
                        enabled: true
                    },
                    scrolling: {
                        mode: "infinite"
                    },
                    width: 1150,
                    showBorders: true,
                    onFocusedCellChanging: e => this.onFocusedCellChanging(e),
                    onRowUpdated: e => this.onRowUpdated(e)
                },
            },
            operations: {
                editable: false
            }
        }
    }

    añoLectivoReadOnly() {
        return false;
    }

    setRowsAndColumns(data) {
        const hasTpColumns = data.tpColumns != undefined && 0 < data.tpColumns.length;
        let columns = this.fixedColumns(hasTpColumns);
        if (hasTpColumns) {
            columns = columns.concat(data.tpColumns)
        }
        this.list().resetColumns(columns);
        this.list().setDataSource(DsArray(data.rows));
    }

    fixedColumns(hasTpColumns) {
        return [{
            caption: "Alumnos",
            alignment: hasTpColumns ? "center" : "left",
            columns: [{
                    dataField: "id",
                    visible: false
                },
                {
                    dataField: "apellido",
                    width: 140,
                    allowEditing: false,
                    allowResizing: false,
                },
                {
                    dataField: "nombre",
                    width: 140,
                    allowEditing: false,
                    allowResizing: false
                }
            ],
            fixed: true
        }]
    }

    labelText() {
        return "Evaluaciones"
    }

    afterRender() {
        super.afterRender();
        this.filter().setEditorValue("añolectivo", AñosLectivos.Get(Dates.ThisYear()));
    }

    blankData() {
        this.list().resetColumns(this.fixedColumns());
        this.list().setDataSource(null);
    }

    itemMateriaCursoOnValueChanged(e) {
        if (this.materiacurso() != undefined) {
            Rest.Promise({ path: "evaluaciones/list", data: { materiacurso: this.materiacurso().id } })
                .then(data =>
                    this.setRowsAndColumns(data))
        } else {
            Rest.Promise({ path: "alumnos/list", data: { curso: this.curso().id } })
                .then(data =>
                    this.setRowsAndColumns({ rows: data }))
        }
    }

    onFocusedCellChanging(e) {
        return e.newColumnIndex < 2 ? e.cancel = true : undefined
    }

    onRowUpdated(e) {
        const tpNota = this.tpNota(e.data);
        Rest.Promise({
                path: "evaluaciones/update",
                data: {
                    alumno: e.data.id,
                    tp: tpNota.tp,
                    nota: tpNota.nota
                }
            })
            .then(data =>
                this.list().focus())
            .catch(err => {
                App.ShowError(err);
                this.list().cancelEditCell();
            })
    }

    tpNota(data) {
        const tp = this.list().editColumnName();
        return { tp: tp, nota: data[tp] };
    }

}