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
                    columns: this.fixedColumns(),
                    wordWrapEnabled: true,
                    editing: {
                        mode: "cell",
                        allowUpdating: true,
                        startEditAction: "click",
                        selectTextOnEditStart: true
                    },
                    columnFixing: {
                        enabled: true
                    },
                    scrolling: {
                        mode: "infinite"
                    },
                    showBorders: true,
                    onFocusedCellChanging: e => this.onFocusedCellChanging(e),
                    onRowValidating: e => this.onRowValidating(e),
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

    cursoDeferRendering() {
        return false;
    }

    setRowsAndColumns(data) {
        this.tpColumns = data.tpColumns;
        this.hasTpColumns = this.tpColumns != undefined && 0 < this.tpColumns.length;
        this.columns = this.fixedColumns(this.hasTpColumns);
        if (this.hasTpColumns) {
            this.columns = this.columns.concat(data.tpColumns)
        }
        this.list().resetColumns(this.columns);
        this.list().setDataSource(DsArray(data.rows));
    }

    contextMenuItems() {
        return [
            this.itemAddAlumno(),
            this.itemAddTp()
        ]
    }

    itemAddAlumno() {
        if (this.materiacurso() != undefined) {
            return {
                text: "Agrega Alumno",
                onClick: e => this.addAlumno()
            }
        }
    }

    itemAddTp() {
        if (this.materiacurso() != undefined) {
            return {
                text: "Agrega Trabajo Práctico",
                onClick: e => this.addTp(),
            }
        }
    }

    addAlumno() {
        new AlumnosCursoForm({
            listView: this,
            components: {
                form: {
                    formData: {
                        añolectivo: this.filterValue("añolectivo").id,
                        curso: this.curso().id,
                        descripcion: this.filterText("curso"),
                    }
                }
            }
        }).render().then(id => {
            if (Utils.IsString(id)) {
                this.refresh(id);
            }
        })
    }

    addTp() {
        new TpsCursoForm({
                listView: this,
                components: {
                    form: {
                        formData: {
                            añolectivo: this.filterValue("añolectivo").id,
                            descripcion: this.filterText("curso"),
                            desde: Dates.Today(),
                            hasta: Dates.TodayPlusDays(5)
                        }
                    }
                }
            }).render()
            .then(id => {
                if (Utils.IsString(id)) {
                    this.refresh()
                }
            });
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
                    width: hasTpColumns ? 140 : undefined,
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

    refresh(id) {
        let promise;
        if (this.materiacurso() != undefined) {
            promise = Rest.Promise({ path: "evaluaciones/list", data: { materiacurso: this.materiacurso().id } })
                .then(data =>
                    this.setRowsAndColumns(data))
        } else {
            promise = Rest.Promise({ path: "alumnos/list", data: { curso: this.curso().id } })
                .then(data =>
                    this.setRowsAndColumns({ rows: data }))
        }
        return promise
            .then(() => {
                if (id != undefined) {
                    this.list().focusRowById(id)
                } else {
                    this.list().focus();
                }

            })
    }

    itemMateriaCursoOnValueChanged(e) {
        return this.refresh()
    }

    onFocusedCellChanging(e) {
        if (e.newColumnIndex < 2) {
            e.cancel = true
        }
    }

    onRowValidating(e) {
        const tpNota = this.tpNota(e.newData);
        e.promise = Rest.Promise({
                path: "evaluaciones/update",
                data: {
                    alumno: e.oldData.id,
                    tp: tpNota.tp,
                    nota: tpNota.nota
                }
            })
            .then(data =>
                this.list().focus()
            )
            .catch(err => {
                App.ShowError(err);
                this.list().cancelEdit();
            })
    }

    tpNota(data) {
        const tp = this.list().editColumnName();
        return { tp: tp, nota: data[tp] };
    }

    listOnRowDblClick(e) {}

}