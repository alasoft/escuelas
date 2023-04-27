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
                    showBorders: true,
                    wordWrapEnabled: true,
                    hoverStateEnabled: true,
                    //                    columnAutoWidth: true,
                    groupPanel: {
                        visible: false
                    },
                    onCellPrepared: e => this.listOnCellPrepared(e),
                    onKeyDown: e => this.listOnKeyDown(e),
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    onContentReady: e => this.listOnContentReady(e),
                    onDisposing: e => this.listOnDisposing(e)
                },
                contextMenu: {
                    target: this.findElementByClass("list")
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

    refreshContextMenuItems() {
        if (this.contextMenu() != undefined && this.contextMenu().instance() != undefined) {
            this.contextMenu().setItems(this.contextMenuItems());
        }
    }

    contextMenuItems() {
        return [this.itemNotasAlumno()]
    }

    itemNotasAlumno() {
        return {
            text: "Notas del Alumno",
            onClick: e => this.notasAlumno(),
        }
    }

    refresh() {
        return this.notasData().refresh(this.materiaCurso())
            .then(() =>
                this.list().resetColumns(this.columns()))
            .then(() =>
                this.list().setArrayDataSource(this.rows()))
            .then(() =>
                this.loadState())
            .then(() =>
                this.list().focus())
    }

    refreshRows() {
        this.list().setArrayDataSource(this.rows())
    }

    columns() {
        return new NotasColumns(this).columns();
    }

    rows() {
        return new NotasRows(this).rows()
    }

    notasData() {
        if (this._notasData == undefined) {
            this._notasData = new NotasData()
        }
        return this._notasData;
    }

    filter() {
        return this.components().filter;
    }

    list() {
        return this.components().list;
    }

    contextMenu() {
        return this.components().contextMenu;
    }

    listToolbarItems() {
        return [this.itemAlumnos(), this.itemExamenes(), this.itemExcel(), "searchPanel"]
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

    getState() {
        return Utils.Merge(super.getState(), { list: this.list().getState() })
    }

    setState() {
        super.setState();
        this.list()
            .setState(this.state.list || null)
            .focusFirstRow()
    }

    itemExamenes() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "background",
                text: "Examenes",
                hint: "Consulta Examenes de la Materia",
                onClick: e => this.examenes()
            }
        }
    }

    itemExcel() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "exportxlsx",
                hint: "Exporta a Excel",
                onClick: e => this.exportExcelDialog(e)
            }
        }
    }

    exportExcelDialog(e) {
        new ExportExcelDialog({ fileName: this.excelFileName(), width: 700 }).render()
            .then(data => {
                if (data.okey) {
                    this.exportExcel(e, this.excelFileName())
                }
            })
    }

    excelFileName() {
        return "Notas " + this.getFilterText("curso") +
            " - " +
            this.getFilterText("materiacurso") +
            " / " +
            this.getFilterText("añolectivo")
    }

    exportExcel(e, fileName) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(fileName);

        DevExpress.excelExporter.exportDataGrid({
            component: this.list().instance(),
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName + '.xlsx');
            });
        });
        e.cancel = true;
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

    examenes() {
        new ExamenesCurso({
                mode: "popup",
                showTodosButton: false,
                curso: this.curso(),
                añoLectivoReadOnly: true,
                cursoReadOnly: true,
                materiaCursoReadOnly: true,
                materiacurso: this.materiaCurso()
            }).render()
            .then(closeData =>
                this.afterExamenes(closeData))
    }

    afterExamenes(closeData) {
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
        if (this.isFullScreen()) {
            App.HideItems();
        }
        this.refreshFilterValue("añolectivo", Dates.ThisYear());
    }

    notasAlumno() {
        new NotasAlumno({
                listView: this
            }).render()
            .then(closeData => {
                if (closeData.dataHasChanged) {
                    this.refreshRows()
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
        //        return this.notasData().alumnoStatusPresente(this.alumno("id"))
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
        if (e.column.temporalidad == Dates.PASADO || e.column.temporalidad == Dates.FUTURO) {
            e.cellElement.css({
                "background-color": "rgb(225, 228, 228)"
            })
        } else if (e.column.temporalidad == Dates.PRESENTE) {
            e.cellElement.css({
                "background-color": "rgb(181, 238, 220)"
            })
        }
    }

    listOnDisposing(e) {
        this.saveState();
    }

    listOnContentReady(e) {
        this.refreshContextMenuItems()
    }

    listOnRowDblClick(e) {
        this.notasAlumno();
    }

    listOnKeyDown(e) {
        if (e.event.key == "Enter" && this.list().hasRows()) {
            this.notasAlumno()
        }
    }

}

class NotasColumns {

    constructor(notas) {
        this.notas = notas;
        this.notasData = this.notas.notasData();
        this.periodosRows = this.notasData.periodosRows;
    }

    columns() {
        const columns = this.alumnoColumns().concat(this.periodosColumns(), this.anualColumn(), this.emptyColumn());
        return columns;
    }

    alumnoColumns() {
        return [{
                dataField: "id",
                visible: false
            },
            { dataField: "apellido", width: 120, allowReordering: false },
            { dataField: "nombre", width: 0 < this.periodosRows.length ? 120 : undefined, allowReordering: false }
        ]
    }

    periodosColumns() {

        function temporalidadDescripcion(t) {
            if (t == Dates.PASADO) {
                return " / Cerrado"
            } else if (t == Dates.PRESENTE) {
                return " / Vigente"
            } else {
                return ""
            }
        }

        const columns = []
        for (const row of this.periodosRows) {
            columns.push({
                headerCellTemplate: row.nombre + temporalidadDescripcion(row.temporalidad) + "<small><br>" + Dates.DesdeHasta(row.desde, row.hasta),
                alignment: "center",
                temporalidad: row.temporalidad,
                columns: this.periodoColumns(row),
                allowReordering: false,
                allowResizing: true
            })
        }
        return columns;
    }

    periodoColumns(row) {
        return [{
                dataField: "promedio_" + row.id,
                caption: "Promedio",
                temporalidad: row.temporalidad,
                width: 80,
                calculateCellValue: r => row.temporalidad != Dates.FUTURO ? r["periodo_" + row.id].promedio : ""
            },
            {
                dataField: "valoracion_" + row.id,
                caption: "Valoración",
                temporalidad: row.temporalidad,
                width: 90,
                calculateCellValue: r => row.temporalidad != Dates.FUTURO ? r["periodo_" + row.id].valoracion : ""
            },
            {
                dataField: "status_" + row.id,
                caption: "Status",
                temporalidad: row.temporalidad,
                visible: true,
                width: 150,
                calculateCellValue: r => row.temporalidad != Dates.FUTURO ? r["periodo_" + row.id].status : ""
            }
        ]
    }

    anualColumn() {
        return [{
            caption: "Anual",
            alignment: "center",
            columns: this.anualColumns()
        }]
    }

    anualColumns() {
        return [{
                dataField: "promedio_anual",
                caption: "Promedio",
                width: 80,
                calculateCellValue: r => r.total.promedio
            },
            {
                dataField: "valoracion_anual",
                caption: "Valoración",
                width: 90,
                calculateCellValue: r => r.total.valoracion
            }
        ]

    }

    emptyColumn() {
        return {
            //allowResizing: true
        }
    }

}

class NotasRows {

    constructor(notas) {
        this.notas = notas;
        this.notasData = this.notas.notasData();
        this.alumnosRows = this.notasData.alumnosRows;
    }

    rows() {
        const rows = [];
        for (const row of this.alumnosRows) {
            const alumno = { id: row.id, apellido: row.apellido, nombre: row.nombre };
            const promedios = this.notasData.alumnoPromedios(row.id)
            const anual = this.notasData.promedioTotal(promedios)
            rows.push(Object.assign({}, alumno, promedios, anual))
        }
        return rows;
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
                this.list(),
                this.contextMenu()
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

    contextMenu() {
        return {
            name: "contextMenu"
        }
    }

}