class Notas extends View {

    extraConfiguration() {
        return {
            mode: "view",
            fullScreen: true,
            components: {
                label: {
                    text: "Notas por Curso y Materia"
                },
                filter: {
                    items: this.filterItems(),
                    labelLocation: "top",
                    width: 750
                },
                alumnosResizer: {
                    handles: "right"
                },
                alumnos: {
                    componentClass: Grid,
                    columns: this.alumnosColumns(),
                    showBorders: true,
                    toolbar: {
                        items: [this.itemAlumnosView(), "searchPanel"]
                    },
                    groupPanel: {
                        visible: false
                    },
                    onFocusedRowChanged: e => this.alumnosOnFocusedRowChanged(e)
                },
                tps: {
                    componentClass: Grid,
                    columns: this.tpsColumns(),
                    showBorders: true,
                    toolbar: {
                        items: [this.itemTpsView()]
                    },
                    editing: {
                        mode: "cell",
                        allowUpdating: true,
                        startEditAction: "click",
                        selectTextOnEditStart: true
                    },
                    summary: {
                        totalItems: [{
                            name: "promedioNotas",
                            column: "nota",
                            customizeText: data => data.value,
                            summaryType: "avg"
                        }],
                    },
                    onRowValidating: e => this.tpsOnRowValidating(e),
                }
            }
        }
    }

    defineTemplate() {
        return new NotasTemplate()
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 6,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso(),
                    this.itemMateriaCurso()
                ]
            })
        ]
    }

    itemAñoLectivo() {
        return Item.Lookup({
            dataField: "añolectivo",
            dataSource: AñosLectivos.DataSource(),
            width: 100,
            label: "Año Lectivo",
            onValueChanged: e =>
                this.itemAñoLectivoOnValueChanged(e)
        })
    }

    itemCurso() {
        return Item.Lookup({
            dataField: "curso",
            label: "Curso",
            deferRendering: false,
            colSpan: 4,
            displayExpr: item =>
                Cursos.Descripcion(item),
            width: 450,
            onValueChanged: e =>
                this.itemCursoOnValueChanged(e)
        })
    }

    itemMateriaCurso(p) {
        return Item.Lookup({
            dataField: "materiacurso",
            label: "Materia",
            deferRendering: false,
            buttons: ["dropDown",
                {
                    name: "materiacurso",
                    options: {
                        icon: "search",
                        hint: "Consulta Materias dictadas en el Curso",
                        onClick: e => this.materiasCurso()
                    }
                }
            ],
            displayExpr: item =>
                item != null ? item.materianombre : "",
            width: 250,
            onSelectionChanged: e =>
                this.itemMateriaCursoOnSelectionChanged(e),
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        })
    }

    tpsColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "nombre", caption: "Trabajo Práctico", editing: false, width: 350 }),
            Column.Text({ dataField: "nota", caption: "Nota", width: 130, dataType: "number", format: "##" }),
            Column.Calculated({ caption: "Inicia - Entrega", formula: row => Dates.Format(row.desde) + "  - " + Dates.Format(row.hasta), width: 250 }),
            Column.Text({ dataField: "periodonombre", caption: "Período", editing: false })
        ]
    }

    itemTpsView() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "search",
                text: "Consulta",
                hint: "Consulta Trabajos Prácticos",
                onClick: e => this.tpsCurso()
            }
        }
    }

    materiasCurso() {
        new MateriasCurso({
                mode: "popup",
                curso: this.curso(),
                cursoReadOnly: true,
                showHorarios: false
            }).render()
            .then(closeData =>
                this.afterMateriasCurso(closeData))
    }

    afterMateriasCurso(closeData) {
        if (closeData.dataHasChanged == true) {
            this.refreshMateriaCursoDataSource(closeData.id)
        } else if (closeData.id != undefined) {
            this.refreshFilterValue("materiacurso", closeData.id)
        }
    }

    tpsCurso() {
        new TpsCurso({
                mode: "popup",
                showTodosButton: false,
                curso: this.curso(),
                materiacurso: this.materiaCurso()
            }).render()
            .then(closeData =>
                this.afterTpsCurso(closeData))
    }

    afterTpsCurso(closeData) {
        if (closeData.curso != undefined && this.curso() != closeData.curso) {
            this.refreshFilterValue("curso", closeData.curso)
        }
        if (closeData.materiaCurso != undefined && this.materiaCurso() != closeData.materiaCurso) {
            this.refreshFilterValue("materiacurso", closeData.materiaCurso)
        }
    }

    itemAlumnosView() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "search",
                text: "Consulta",
                hint: "Consulta Alumnos",
                onClick: e => this.alumnosCurso()
            }
        }
    }

    alumnosCurso() {
        new AlumnosCurso({
                mode: "popup",
                curso: this.curso(),
                cursoReadOnly: true
            })
            .render().then(closeData =>
                this.afterAlumnosCurso(closeData))
    }

    afterAlumnosCurso(closeData) {
        if (closeData.dataHasChanged == true) {
            this.refreshAlumnosDataSource(closeData.id)
        } else if (closeData.id != undefined) {
            this.alumnos().focusRowById(closeData.id)
        }
    }

    alumnosColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "apellido" }),
            Column.Text({ dataField: "nombre" }),
            Column.Text({ dataField: "promedio", width: 100 })
        ]
    }

    alumnoApellidoNombre() {
        const row = this.alumnos().focusedRowData();
        if (row != undefined) {
            return Strings.Concatenate([row.apellido, row.nombre], ", ");
        } else {
            return "";
        }
    }

    filter() {
        return this.components().filter;
    }

    toolbar() {
        return this.components().toolbar;
    }

    alumnos() {
        return this.components().alumnos;
    }

    tps() {
        return this.components().tps;
    }

    getFilterValue(dataField) {
        return this.filter().getEditorValue(dataField);
    }

    getFilterText(dataField) {
        return this.filter().getEditorText(dataField);
    }

    getFilterSelectedValue(dataField, name) {
        return this.filter().getEditorSelectedValue(dataField, name)
    }

    setFilterValue(dataField, value) {
        this.refreshFilterValue(dataField, value);
    }

    refreshFilterValue(dataField, value) {
        this.filter().refreshEditorValue(dataField, value)
    }

    añoLectivo() {
        return this.getFilterValue("añolectivo");
    }

    curso() {
        return this.getFilterValue("curso")
    }

    materiaCurso() {
        return this.getFilterValue("materiacurso")
    }

    alumno() {
        return this.alumnos().id()
    }

    setItemCursoDataSource() {
        if (this.añoLectivo() != undefined) {
            this.filter().setEditorDataSource("curso",
                Ds({
                    path: "cursos",
                    filter: { añolectivo: this.añoLectivo() },
                    onLoaded: this.filter().onLoadedSetFirstValue("curso")
                })
            );
        } else {
            this.filter().setEditorDataSource("curso", null);
        }
    }

    refreshMateriaCursoDataSource(id) {
        if (this.curso() != undefined) {
            new Rest({ path: "materias_cursos" })
                .promise({
                    verb: "list",
                    data: {
                        curso: this.curso()
                    }
                }).then(rows => {
                    this.filter().setEditorDataSource("materiacurso", DsArray({ rows: rows }));
                    this.filter().setEditorValue("materiacurso", rows[0].id)
                })
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    refreshAlumnosDataSource(id) {
        if (this.curso() != undefined) {
            new Rest({
                    path: "alumnos"
                }).promise({
                    verb: "list",
                    data: {
                        curso: this.curso()
                    }
                })
                .then(rows =>
                    this.alumnos().setDataSource(DsArray({ rows: this.alumnosRows(rows) })))
                .then(() =>
                    id != undefined ? this.alumnos().focusRowById(id) : undefined)
                .then(() =>
                    this.refreshTpsLabel())
        } else {
            this.alumnos().setDataSource(null);
        }
    }

    alumnosRows(rows) {
        return rows;
    }

    refreshTpsDataSource() {
        if (this.materiaCurso() != undefined && this.alumno() != undefined) {
            new Rest({ path: "notas" })
                .promise({
                    verb: "list",
                    data: {
                        materiacurso: this.materiaCurso(),
                        alumno: this.alumno()
                    }
                })
                .then(rows =>
                    this.tps().setDataSource(DsArray({ rows: rows })))
        } else {
            this.tps().setDataSource(null);
        }
    }

    afterRender() {
        super.afterRender();
        this.refreshFilterValue("añolectivo", Dates.ThisYear())
    }

    saveNote(p) {
        new Rest({ path: "notas" })
            .promise({
                verb: "update",
                data: {
                    tp: p.tp,
                    alumno: this.alumno(),
                    nota: p.nota
                }
            }).then(data =>
                this.tps().focus()
            ).catch(err => {
                if (err.code == Exceptions.NOTA_OUT_OF_RANGE) {
                    App.ShowMessage({ message: "La nota debe estar entre 1 y 10" })
                }
            })
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setItemCursoDataSource();
    }

    itemCursoOnValueChanged(e) {
        this.refreshMateriaCursoDataSource();
        this.refreshAlumnosDataSource();
    }

    itemMateriaCursoOnSelectionChanged(e) {
        this.refreshTpsLabel();
    }

    itemMateriaCursoOnValueChanged(e) {
        this.refreshTpsDataSource()
    }

    alumnosOnFocusedRowChanged(e) {
        this.refreshTpsLabel();
        this.refreshTpsDataSource()
    }

    refreshTpsLabel() {
        const apellidoNombre = this.alumnoApellidoNombre();
        this.tps().setToolbarItems([{
            location: "before",
            text: (apellidoNombre ? apellidoNombre + " / Notas" : "Notas")
        }, this.itemTpsView()])
    }

    tpsOnRowValidating(e) {
        this.saveNote({ tp: e.oldData.id, nota: e.newData.nota });
    }

}

class NotasTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [{
                orientation: "vertical",
                items: [{
                    name: "label",
                    marginBottom: 5,
                }, {
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                    items: [{
                        name: "filter",
                        backgroundColor: App.BOX_BACKGROUND_COLOR,
                        padding: App.BOX_PADDING,
                        orientation: "vertical",
                    }]
                }],
            }, {
                fillContainer: true,
                orientation: "horizontal",
                backgroundColor: App.BOX_BACKGROUND_COLOR,
                padding: App.BOX_PADDING,
                items: [{
                        width: 400,
                        orientation: "vertical",
                        marginRight: 10,
                        items: [{
                            name: "alumnosResizer",
                            fillContainer: true,
                            orientation: "vertical",
                            items: [{
                                name: "alumnos",
                                fillContainer: true,
                                orientation: "vertical",
                                height: 0
                            }]
                        }]
                    },
                    {
                        fillContainer: true,
                        orientation: "vertical",
                        items: [{
                            fillContainer: true,
                            orientation: "vertical",
                            items: [{
                                fillContainer: true,
                                orientation: "vertical",
                                name: "tps",
                                height: 0
                            }]
                        }]
                    },
                ]
            }]
        }
    }

}