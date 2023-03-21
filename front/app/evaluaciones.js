class Evaluaciones extends CursosMateriasDetalle {

    extraConfiguration() {
        return {
            mode: "view",
            fullScreen: true,
            components: {
                label: {
                    text: "Calificaciones"
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
                    groupPanel: {
                        visible: false
                    },
                    showBorders: true,
                    onFocusedCellChanging: e => this.onFocusedCellChanging(e),
                    onRowValidating: e => this.onRowValidating(e),
                },
            },
            operations: ["export"]
        }
    }

    itemCurso(p) {
        return super.itemCurso({
            deferRendering: false
        })
    }

    itemMateriaCurso(p) {
        return super.itemMateriaCurso({
            deferRendering: false
        })
    }

    toolbarItems() {
        if (this.filter().isReady()) {
            return [
                this.itemAlumnos(),
                this.itemTps(),
                this.itemExportExcel(),
            ]
        }
    }

    itemAlumnos() {
        if (Utils.IsDefined(this.curso())) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Alumnos",
                    icon: "group",
                    onClick: e => this.showAlumnos(e)
                }
            }
        }
    }

    itemTps() {
        if (Utils.IsDefined(this.materiaCurso())) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Trabajos Prácticos",
                    icon: "check",
                    onClick: e => this.showTps(e)
                }
            }
        }
    }

    showAlumnos() {
        this.showDetail(new AlumnosCurso(this.detailParameters()))
    }

    showTps() {
        this.showDetail(new TpsCurso(this.detailParameters()))
    }

    showDetail(detail) {
        detail.render()
            .then(data => {
                this.setFilterValue("curso", data.curso)
                if (Utils.IsDefined(data.materiacurso)) {
                    this.setFilterValue("materiacurso", data.materiacurso)
                }
            });
    }

    detailParameters() {
        return {
            mode: "popup",
            añolectivo: this.getFilterValue("añolectivo"),
            curso: this.curso(),
            materiacurso: this.materiaCurso()
        }
    }

    setRowsAndColumns(data) {
        this.tpColumns = Utils.IsDefined(data) ? data.tpColumns : undefined;
        this.hasTpColumns = Utils.IsDefined(this.tpColumns) && (0 < this.tpColumns.length);
        this.columns = this.fixedColumns(this.hasTpColumns);
        if (this.hasTpColumns) {
            this.columns = this.columns.concat(data.tpColumns)
        }
        this.list().resetColumns(this.columns);
        if (Utils.IsDefined(data)) {
            this.list().setDataSource(DsArray({ data: data.rows }));
        } else {
            this.list().clearDataSource();
        }
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

    contextMenuItems() {
        return [
            this.itemAddAlumno(),
            this.itemAddTp()
        ]
    }

    itemAddAlumno() {
        if (this.materiaCurso() != undefined) {
            return {
                text: "Agrega Alumno",
                onClick: e => this.addAlumno()
            }
        }
    }

    itemAddTp() {
        if (this.materiaCurso() != undefined) {
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
                        descripcion: this.getFilterText("curso"),
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
                            descripcion: this.getFilterText("curso"),
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

    blankData() {
        this.list().resetColumns(this.fixedColumns());
        this.list().setDataSource(null);
    }

    refresh(id) {
        let promise;
        if (this.materiaCurso() != undefined) {
            promise = Rest.Promise({ path: "evaluaciones/list", data: { materiacurso: this.materiaCurso() } })
                .then(data =>
                    this.setRowsAndColumns(data))
        } else if (Utils.IsDefined(this.curso())) {
            promise = Rest.Promise({ path: "alumnos/list", data: { curso: this.curso().id } })
                .then(data =>
                    this.setRowsAndColumns({ rows: data }))
        } else {
            promise = Promise.resolve(this.setRowsAndColumns())
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
        if (e.newColumnIndex < 1) {
            //            e.cancel = true
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

    excelFileName() {
        return "Evaluaciones de  " +
            this.getFilterText("curso") + " / " +
            this.getFilterText("materiacurso") + " / " +
            this.getFilterText("añolectivo");
    }

    exportExcelDialogWidth() {
        return 850
    }

    listOnRowDblClick(e) {}

}