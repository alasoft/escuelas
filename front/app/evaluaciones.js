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
                    columns: this.fixedColumns(),
                    allowColumnResizing: false,
                    allowColumnReordering: false,
                    wordWrapEnabled: true,
                    //                    focusedRowEnabled: false,
                    editing: {
                        mode: "cell",
                        allowUpdating: true,
                        selectTextOnEditStart: true,
                        startEditAction: "click"
                    },
                    columnFixing: {
                        //                        enabled: true
                    },
                    scrolling: {
                        //                        mode: "infinite"
                    },
                    onFocusedCellChanging: e => this.onFocusedCellChanging(e),
                },
            },
            operations: {
                allowInserting: false,
            }
        }
    }

    añoLectivoReadOnly() {
        return false;
    }

    setRowsAndColumns(data) {
        this.list().resetColumns(this.fixedColumns(0 < data.columns.length).concat(data.columns));
        this.list().setDataSource(DsArray(data.rows));
    }

    fixedColumns(additionalColumns = false) {
        return [{
            caption: "Alumnos",
            alignment: "center",
            columns: [{
                    dataField: "id",
                    visible: false
                },
                {
                    dataField: "apellido",
                    width: 140,
                    allowEditing: false
                },
                {
                    dataField: "nombre",
                    width: (additionalColumns ? 140 : undefined),
                    allowEditing: false,
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

    itemMateriaCursoOnValueChanged(e) {
        if (this.filterText("materiacurso")) {
            Rest.Promise({ path: "evaluaciones/list", data: { materiacurso: this.materiacurso().id } })
                .then(data =>
                    this.setRowsAndColumns(data))
        } else {
            this.blankData()
        }
    }

    blankData() {
        this.list().resetColumns(this.fixedColumns());
        this.list().setDataSource(null);
    }

    onFocusedCellChanging(e) {
        //        return e.newColumnIndex < 2 ? e.cancel = true : undefined
    }

}