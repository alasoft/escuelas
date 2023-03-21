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
                alumnosLabel: {
                    componentClass: Label,
                    text: "Alumnos del Curso",
                    styles: { "font-size": "small", "padding-left": 5 }
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
                tpsLabel: {
                    componentClass: Label,
                    text: "Notas",
                    styles: { "font-size": "small", "padding-left": 5 }
                },
                tps: {
                    componentClass: Grid,
                    columns: this.tpsColumns(),
                    showBorders: true,
                    toolbar: {
                        items: [this.itemTpsView(), this.itemTpsExcel()]
                    },
                    editing: {
                        mode: "cell",
                        allowUpdating: true,
                        startEditAction: "click",
                        selectTextOnEditStart: true
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
            displayExpr: item =>
                item != null ? item.materianombre : "",
            width: 250,
            onSelectionChanged: e =>
                this.itemMateriaCursoOnSelectionChanged(e),
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        })
    }

    itemToggleAlumnos() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "group",
                text: "Oculta Alumnos",
                onClick: e => this.template().toggleByClassName("alumnosResizer")
            }
        }
    }

    tpsColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "nombre", caption: "Trabajo Práctico", editing: false, width: 350 }),
            Column.Text({ dataField: "nota", caption: "Nota", width: 130 }),
            Column.Calculated({ caption: "Inicia - Entrega", formula: row => Dates.Format(row.desde) + "  - " + Dates.Format(row.hasta), width: 250 }),
            Column.Text({ dataField: "periodonombre", caption: "Período", editing: false })
        ]
    }

    itemTpsView() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "search",
                text: "Consulta",
                hint: "Consulta Trabajos Prácticos",
                onClick: e => new TpsCurso({ mode: "popup" }).render()
            }
        }
    }

    itemTpsExcel() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "exportxlsx",
                hint: "Exporta a Excel",
                onClick: e => this.exportExcelDialog(e)
            }
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
                onClick: e => new AlumnosCurso({ mode: "popup" }).render()
            }
        }
    }

    alumnosColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "apellido" }),
            Column.Text({ dataField: "nombre" })
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

    tpsLabel() {
        return this.components().tpsLabel
    }

    alumnosLabel() {
        return this.components().alumnosLabel
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

    setItemMateriaCursoDataSource() {
        if (this.curso() != undefined) {
            this.filter().setEditorDataSource("materiacurso",
                Ds({
                    path: "materias_cursos",
                    filter: { curso: this.curso() },
                    onLoaded: this.filter().onLoadedSetFirstValue("materiacurso")
                }),
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    setAlumnosDataSource() {
        if (this.curso() != undefined) {
            this.alumnos().setDataSource(
                Ds({
                    path: "alumnos",
                    filter: { curso: this.curso() },
                }),
            );
        } else {
            this.alumnos().setDataSource(null);
        }
    }

    setTpsDataSource() {
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
                    this.tps().setDataSource(DsArray({ data: rows })))
        } else {
            this.tps().setDataSource(null);
        }
    }

    afterRender() {
        super.afterRender();
        this.refreshFilterValue("añolectivo", Dates.ThisYear())
    }

    saveNote(data) {
        new Rest({ path: "notas" })
            .promise({
                verb: "update",
                data: {
                    tp: this.tps().id(),
                    alumno: this.alumno(),
                    nota: data.nota
                }
            }).then(data =>
                this.tps().focus()
            )
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setItemCursoDataSource();
    }

    itemCursoOnValueChanged(e) {
        this.setItemMateriaCursoDataSource();
        this.setAlumnosDataSource();
    }

    itemMateriaCursoOnSelectionChanged(e) {
        this.refreshTpsLabel();
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setTpsDataSource()
    }

    alumnosOnFocusedRowChanged(e) {
        this.refreshTpsLabel();
        this.setTpsDataSource()
    }

    refreshTpsLabel() {
        const notasDe = this.getFilterSelectedValue("materiacurso", "materianombre");
        const apellidoNombre = this.alumnoApellidoNombre();
        this.tpsLabel().setHtml(
            (notasDe ? "Notas de: " + notasDe + Html.Tab(1) + " / " + Html.Tab(1) : "") +
            (apellidoNombre ? "Alumno: " + apellidoNombre : "")
        )
    }

    tpsOnRowValidating(e) {
        this.saveNote(e.newData);
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
                        fillContainer: true,
                        orientation: "vertical",
                        marginRight: 10,
                        items: [{
                                name: "tpsLabel",
                                marginBottom: 5,
                            },
                            {
                                fillContainer: true,
                                orientation: "vertical",
                                items: [{
                                    fillContainer: true,
                                    orientation: "vertical",
                                    name: "tps",
                                    height: 0
                                }]
                            }
                        ]
                    },
                    {
                        width: 400,
                        orientation: "vertical",
                        items: [{
                                name: "alumnosLabel",
                                marginBottom: 5,
                            },
                            {
                                name: "alumnos",
                                fillContainer: true,
                                orientation: "vertical",
                                height: 0
                            }
                        ]
                    },

                ]
            }]
        }
    }

}