class Evaluaciones extends CursosMateriasDetalle {

    extraConfiguration() {
        return {
            mode: "view",
            components: {
                filter: {
                    width: 900,
                    height: 120
                },
                label: {
                    text: "Evaluaciones"
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
                allowEditing: false,
                allowDeleting: false,
                allowExport: true
            }
        }
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 4,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso(),
                ]
            }),
            Item.Group({
                items: [
                    this.itemMateriaCurso()
                ]
            })
        ]
    }

    itemCursoWidth() {
        return 400
    }

    itemCursoColSpan() {
        return 3;
    }

    añoLectivoReadOnly() {
        return false;
    }

    itemCursoDeferRendering() {
        return false;
    }

    listToolbarItems() {
        if (this.filter().isReady()) {
            return [
                this.itemAlumnos(),
                this.itemMaterias(),
                this.itemTps(),
                this.itemExportButton(),
                this.itemSearchPanel()
            ]
        }
    }

    itemMaterias() {
        if (Utils.IsDefined(this.curso())) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Materias",
                    icon: "folder",
                    onClick: e => this.showMaterias(e)
                }
            }
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
        if (Utils.IsDefined(this.materiacurso())) {
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

    showMaterias() {
        this.showDetail(MateriasCurso)
    }

    showAlumnos() {
        this.showDetail(AlumnosCurso)
    }

    showTps() {
        this.showDetail(TpsCurso)
    }

    showDetail(detailClass) {
        new detailClass(this.detailParameters()).render()
            .then(data => {
                this.filterSetValue("curso", data.curso)
                if (Utils.IsDefined(data.materiacurso)) {
                    this.filterSetValue("materiacurso", data.materiacurso)
                }
            });
    }

    detailParameters() {
        return {
            añolectivo: this.filter().getEditorValue("añolectivo"),
            curso: this.curso(),
            materiacurso: this.materiacurso()
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
            this.list().setDataSource(DsArray(data.rows));
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
            this.filterText("curso") + " / " +
            this.filterText("materiacurso") + " / " +
            this.filterText("añolectivo");
    }

    exportExcelDialogWidth() {
        return 850
    }

    listOnRowDblClick(e) {}

}