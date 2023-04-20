class Notas extends View {

    extraConfiguration() {
        return {
            fullScreen: false,
            components: {
                label: {
                    text: "Notas por Curso y Materia"
                },
                filter: {
                    items: this.filterItems(),
                    labelLocation: "top",
                    width: 750
                },
                list: {
                    keyExpr: "id",
                    focusedRowEnabled: false,
                    dataSource: [],
                    toolbar: {
                        items: this.listToolbarItems()
                    },
                    columns: this.columns(),
                    showBorders: true,
                    wordWrapEnabled: true,
                    hoverStateEnabled: true,
                    groupPanel: {
                        visible: false
                    },
                    onCellPrepared: e => this.listOnCellPrepared(e),
                    onKeyDown: e => this.listOnKeyDown(e),
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    onFocusedRowChanging: e => this.listOnFocusedRowChanging(e)
                }
            }
        }
    }

    defineTemplate() {
        return new NotasTemplate();
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

    columns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "apellido", width: 200 }),
            Column.Text({ dataField: "nombre", width: 200 })
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

    itemCurso(p) {
        return Item.Lookup({
            dataField: "curso",
            deferRendering: false,
            width: 450,
            colSpan: 4,
            displayExpr: item =>
                Cursos.Descripcion(item),
            onValueChanged: e =>
                this.itemCursoOnValueChanged(e)
        })
    }

    itemMateriaCurso(p) {
        return Item.Lookup({
            dataField: "materiacurso",
            deferRendering: false,
            width: 250,
            label: "Materia",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        })
    }

    loadCursos() {
        if (this.añoLectivo() != undefined) {
            new Rest({ path: "cursos" })
                .promise({
                    verb: "list",
                    data: { añolectivo: this.añoLectivo() }
                }).then(rows =>
                    this.filter().setArrayDataSource("curso", rows))
        } else {
            this.filter().clearEditorDataSource("curso");
        }
    }

    loadMateriasCursos() {
        if (this.curso() != undefined) {
            new Rest({ path: "materias_cursos" })
                .promise({
                    verb: "list",
                    data: { curso: this.curso() }
                }).then(rows => {
                    this.filter().setArrayDataSource("materiacurso", rows);
                })
        } else {
            this.filter().clearEditorDataSource("materiacurso");
        }
    }

    refresh() {
        return this.data().refresh(this.materiaCurso())
            .then(() =>
                this.list().resetColumns(this.data().planillaColumns()))
            .then(() =>
                this.list().setArrayDataSource(this.data().planillaRows()))
            .then(() =>
                this.list().focus())
    }

    data() {
        if (this._data == undefined) {
            this._data = new NotasData()
        }
        return this._data;
    }

    filter() {
        return this.components().filter;
    }

    list() {
        return this.components().list;
    }

    listToolbarItems() {
        return [this.itemAlumnos(), this.itemTps(), this.itemExcel(), "searchPanel"]
    }

    itemAlumnos() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "group",
                text: "Alumnos",
                hint: "Consulta Alumnos del Curso",
                onClick: e => this.alumnos()
            }
        }
    }

    itemTps() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "background",
                text: "Trabajos Prácticos",
                hint: "Consulta Trabajos Prácticos de la Materia",
                onClick: e => this.tps()
            }
        }
    }

    itemExcel() {
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

    alumnos() {
        new AlumnosCurso({
                mode: "popup",
                curso: this.curso(),
                añoLectivoReadOnly: true,
                cursoReadOnly: true
            })
            .render().then(closeData =>
                this.afterAlumnos(closeData))
    }

    afterAlumnos(closeData) {
        if (closeData.dataHasChanged == true) {
            this.refresh()
                .then(() =>
                    this.list().focusRowById(closeData.id))
        } else if (closeData.id != undefined) {
            this.list().focusRowById(closeData.id)
        }
    }

    tps() {
        new TpsCurso({
                mode: "popup",
                showTodosButton: false,
                curso: this.curso(),
                añoLectivoReadOnly: true,
                cursoReadOnly: true,
                materiaCursoReadOnly: true,
                materiacurso: this.materiaCurso()
            }).render()
            .then(closeData =>
                this.afterTps(closeData))
    }

    afterTps(closeData) {
        if (closeData.dataHasChanged == true) {
            this.refresh()
        }
    }

    getFilterValue(dataField) {
        return this.filter().getValue(dataField);
    }

    getFilterText(dataField) {
        return this.filter().getEditorText(dataField);
    }

    refreshFilterValue(dataField, value) {
        this.filter().refreshEditorValue(dataField, value);
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

    afterRender() {
        super.afterRender()
            .then(() =>
                this.refreshFilterValue("añolectivo", Dates.ThisYear()));
    }

    alumnoNotas() {
        new AlumnoNotas({
                listView: this
            }).render()
            .then(closeData => {
                if (closeData.dataHasChanged) {
                    this.refresh()
                }
            })
    }

    cursoDescripcion() {
        return this.getFilterText("curso") + " / " + this.getFilterValue("añolectivo")
    }

    materiaDescripcion() {
        return this.getFilterText("materiacurso")
    }

    alumnoDescripcion() {
        return this.row("apellido") + ", " + this.row("nombre")
    }

    alumnoStatus() {
        return this.data().alumnoStatusPresente(this.alumno("id"))
    }

    row(dataField) {
        return this.list().focusedRowValue(dataField)
    }

    alumno() {
        return this.row("id")
    }

    anterior() {
        return this.list().focusPriorRow();
    }

    siguiente() {
        return this.list().focusNextRow()
    }

    itemAñoLectivoOnValueChanged(e) {
        this.loadCursos();
    }

    itemCursoOnValueChanged(e) {
        this.loadMateriasCursos();
    }

    itemMateriaCursoOnValueChanged(e) {
        this.refresh()
    }

    listOnCellPrepared(e) {
        if (e.column.futuro == true) {
            e.cellElement.css({
                "background-color": "rgb(246,240,239)"
            })
        }
    }

    listOnRowDblClick(e) {
        this.alumnoNotas();
    }

    listOnKeyDown(e) {
        if (e.event.key == "Enter" && this.list().hasRows()) {
            this.alumnoNotas()
        }
    }

    listOnFocusedRowChanging(e) {
        return;
        if (e) {
            e.rowElement[0].style.backgroundColor = "green"
        }
    }

}

class NotasTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.label(),
                this.body(),
            ]
        }
    }

    label() {
        return {
            name: "label",
            marginBottom: App.LABEL_BOTTOM_MARGIN
        }
    }

    body() {
        return {
            fillContainer: true,
            orientation: "vertical",
            padding: App.BOX_PADDING,
            backgroundColor: App.BOX_BACKGROUND_COLOR,
            items: [
                this.filter(),
                this.list()
            ]
        }
    }

    filter() {
        return {
            name: "filter",
            orientation: "vertical",
            height: 80
        }
    }

    list() {
        return {
            name: "list",
            fillContainer: true,
            orientation: "vertical",
            height: 1
        }
    }

}