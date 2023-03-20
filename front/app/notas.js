class Notas extends View {

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                fullScreen: true,
                title: "Notas por Curso, Materia y Alumno"
            },
            components: {
                filter: {
                    items: this.filterItems(),
                    labelLocation: "left",
                    width: 700
                },
                toolbar: {},
                alumnosResizer: {
                    componentClass: Resizer
                },
                tps: {
                    componentClass: Grid,
                    columns: this.tpsColumns(),
                    showBorders: true,
                    editing: {
                        mode: "cell",
                        allowUpdating: true,
                        startEditAction: "click",
                        selectTextOnEditStart: true
                    },
                    onRowValidating: e => this.tpsOnRowValidating(e),
                },
                alumnos: {
                    componentClass: Grid,
                    columns: this.alumnosColumns(),
                    showBorders: true,
                    groupPanel: {
                        visible: false
                    },
                    onFocusedRowChanged: e => this.alumnosOnFocusedRowChanged(e)
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
                colCount: 3,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso()
                ]
            }),
            Item.Group({
                colCount: 3,
                items: [
                    this.itemMateriaCurso()
                ]
            })
        ]
    }

    refreshToolbarItems() {
        this.toolbar().setItems(this.toolbarItems());
    }

    toolbarItems() {
        return [this.itemAlumno()]
    }

    itemAñoLectivo() {
        return Item.Lookup({
            dataField: "añolectivo",
            dataSource: AñosLectivos.DataSource(),
            width: 130,
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
            displayExpr: item =>
                Cursos.Descripcion(item),
            width: 400,
            colSpan: 2,
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
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        })
    }

    itemAlumno() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                text: this.alumnoApellidoNombre()
            }
        }
    }

    itemMateriaNombre() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                text: "Notas de: " + this.getFilterText("materiacurso")
            }
        }
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
            Column.Text({ dataField: "nombre", caption: "Trabajo Práctico", editing: false }),
            Column.Text({ dataField: "nota", caption: "Nota" }),
            Column.Text({ dataField: "periodonombre", caption: "Período", editing: false })
        ]
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
            return "Alumno: " + Strings.Concatenate([row.apellido, row.nombre], ", ");
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
        this.refreshFilterValue("añolectivo", Dates.ThisYear())
    }

    saveNote() {
        new Rest({ path: "notas" })
            .promise({
                verb: "update",
                data: {
                    tp: this.tps().id(),
                    alumno: this.alumno(),
                    nota: e.newData.nota
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
        this.refreshToolbarItems();
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setTpsDataSource()
    }

    alumnosOnFocusedRowChanged(e) {
        this.refreshToolbarItems();
        this.setTpsDataSource()
    }

    tpsOnRowValidating(e) {
        this.saveNote();
    }

}

class NotasTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [{
                orientation: "vertical",
                backgroundColor: App.BOX_BACKGROUND_COLOR,
                items: [{
                    name: "filter",
                    padding: App.BOX_PADDING,
                    paddingTop: 5,
                    orientation: "vertical"
                }, {
                    name: "toolbar"
                }]
            }, {
                fillContainer: true,
                orientation: "horizontal",
                items: [{
                    name: "alumnosResizer",
                    width: 500,
                    orientation: "vertical",
                    marginRight: 10,
                    items: [{
                        name: "alumnos",
                        fillContainer: true,
                        orientation: "vertical",
                        height: 1
                    }]
                }, {
                    fillContainer: true,
                    orientation: "vertical",
                    items: [{
                        name: "tps",
                        fillContainer: true,
                        orientation: "vertical",
                        height: 1
                    }]
                }]
            }]
        }
    }

}