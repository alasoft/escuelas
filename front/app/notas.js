class Notas extends View {

    static TemporalidadDescripcion(t) {
        if (t == Dates.PASADO) {
            return " / Cerrado"
        } else if (t == Dates.PRESENTE) {
            return " / Vigente"
        } else {
            return " / Futuro"
        }
    }

    extraConfiguration() {
        return {
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
                list: {
                    keyExpr: "id",
                    focusedRowEnabled: false,
                    dataSource: [],
                    showBorders: true,
                    wordWrapEnabled: true,
                    hoverStateEnabled: true,
                    columnAutoWidth: true,
                    groupPanel: {
                        visible: false
                    },
                    onCellPrepared: e => this.listOnCellPrepared(e),
                    onKeyDown: e => this.listOnKeyDown(e),
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    onContentReady: e => this.listOnContentReady(e),
                    onDisposing: e => this.listOnDisposing(e),
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
        if (this.filter().isReady() && this.añoLectivo() != undefined) {
            new Rest({ path: "cursos" })
                .promise({
                    verb: "list",
                    data: { añolectivo: this.añoLectivo() }
                }).then(rows =>
                    this.filter().setArrayDataSource(
                        "curso", rows, this.settingState == true ? this.state.curso : undefined)
                )
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
                    this.filter().setArrayDataSource(
                        "materiacurso", rows, this.settingState == true ? this.state.materiaCurso : undefined);
                }).then(() =>
                    this.clearSettingState())
        } else {
            this.filter().clearEditorDataSource("materiacurso");
            this.clearSettingState()
        }
    }

    refreshContextMenu() {
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
                this.refreshToolbar())
            .then(() =>
                this.list().resetColumns(this.columns()))
            .then(() =>
                this.list().setArrayDataSource(this.rows()))
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

    refreshToolbar() {
        this.list().setToolbarItems(this.toolbarItems())
    }

    toolbarItems() {
        return [this.itemPeriodos(), this.itemAlumnos(), this.itemExamenes(), this.itemVisualiza(), this.itemExcel(), "searchPanel"]
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

    toggleColumnVisibility(name) {
        return this.list().toggleColumnVisibility(name);
    }

    columnaPeriodoVisible(id) {
        return this.list().isColumnVisible("periodo_" + id);
    }

    columnaPreliminarVisible(id) {
        return this.list().isColumnVisible("preliminar_" + id);
    }

    columnaStatusVisible(id) {
        return this.list().isColumnVisible("status_" + id);
    }

    columnaAnualVisible() {
        return this.list().isColumnVisible("anual");
    }

    itemsMuestra() {
        const items = []
        items.push({
            text: " "
        })
        items.push({
            text: " "
        })
        items.push({
            text: " "
        })
        for (const row of this.notasData().periodosRows) {
            items.push({
                widget: "dxCheckBox",
                location: "center",
                options: {
                    text: row.nombre,
                    hint: "Muestra el " + row.nombre + "  ",
                    onClicke: e => this.muestraOcultaPeriodo()
                }
            });
            items.push({
                text: "   "
            })
            items.push({
                text: "   "
            })
            items.push({
                text: "   "
            })
        }
        items.push({
            widget: "dxCheckBox",
            location: "center",
            options: {
                text: "Anual",
                hint: "Muestra el proyectado Anual",
                onClicke: e => this.muestraOcultaAnual()
            }
        })
        return items;
    }

    muestraOcultaPeriodo(periodo) {

    }

    muestraOcultaAnual() {

    }

    itemPeriodos() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "event",
                text: "Períodos",
                hint: "Consulta los Períodos",
                onClick: e => this.periodos()
            }
        }
    }

    getState() {
        return {
            añoLectivo: this.getFilterValue("añolectivo"),
            curso: this.getFilterValue("curso"),
            materiaCurso: this.getFilterValue("materiacurso"),
            list: this.list().getState(),
        }
    }

    setState() {
        this.settingState = true;
        this.setFilterValue("añolectivo", this.state.añoLectivo || Dates.ThisYear())
    }

    clearSettingState() {
        if (this.settingState == true) {
            this.settingState = false;
        }
    }

    filterHasValue(dataField) {
        return this.filter().editorHasValue(dataField)
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

    itemVisualiza() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "search",
                text: "Visualiza Columnas",
                hind: "Selecciona columnas a visualizar",
                onClick: e => this.visualiza()
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
                    this.exportExcel({
                        e: e,
                        fileName: this.excelFileName(),
                        title: "Notas de la Materia",
                        subTitle: this.materiCursoDescripcion(),
                        //                        before: () => this.beforeExport(),
                    })
                }
            })
    }

    beforeExport() {
        this.ocultaStatus();
        this.ocultaColumnasFuturas();
    }

    excelFileName() {
        return "Notas de: " + this.materiCursoDescripcion()
    }

    materiCursoDescripcion() {
        return this.getFilterText("curso") + ", " + this.getFilterText("materiacurso") +
            " / " + this.getFilterText("añolectivo")
    }

    exportExcel(p) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(p.fileName);

        //        Utils.Evaluate(p.before);

        DevExpress.excelExporter.exportDataGrid({
                component: this.list().instance(),
                worksheet,
                autoFilterEnabled: true,
                topLeftCell: { row: 4, column: 1 }
            })
            .then(cellRange => {
                const titleRow = worksheet.getRow(1);
                const subTitleRow = worksheet.getRow(2);
                titleRow.height = 30;
                subTitleRow.height = 30;
                worksheet.mergeCells(1, 1, 1, 6);
                worksheet.mergeCells(2, 1, 2, 6);

                titleRow.getCell(1).value = p.title;
                titleRow.getCell(1).font = { name: 'Calibri bold', size: 12 };
                titleRow.getCell(1).alignment = { horizontal: 'center' };

                subTitleRow.getCell(2).value = p.subTitle;
                subTitleRow.getCell(1).font = { name: 'Calibri bold', size: 12 };
                subTitleRow.getCell(1).alignment = { horizontal: 'center' };

            })

        .then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), p.fileName + '.xlsx');
            });
        });
        p.e.cancel = true;
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

    periodos() {
        new Periodos({
                mode: "popup",
                añoLectivoReadOnly: true,
                cursoReadOnly: true
            })
            .render().then(closeData =>
                this.afterPeriodos(closeData))
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

    afterPeriodos(closeData) {
        if (closeData.dataHasChanged == true) {
            this.refresh()
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

    getFilterDataSource(dataField) {
        return this.filter().getFilterDataSource(dataField);
    }

    getFilterText(dataField) {
        return this.filter().getEditorText(dataField);
    }

    setFilterValue(dataField, value) {
        this.filter().setEditorValue(dataField, value)
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

    visualiza() {
        new NotasVisualiza({ notas: this }).render()
    }

    ocultaColumnasFuturas() {
        for (const row of this.notasData().periodosRows) {
            if (row.temporalidad == Dates.FUTURO) {
                this.list().hideColumn("periodo_" + row.id)
            }
        }
        this.list().hideColumn("anual")
    }

    ocultaStatus() {
        for (const row of this.notasData().periodosRows) {
            this.list().hideColumn("status_" + row.id)
        }
    }

    listOnCellPrepared(e) {
        if (e.column.temporalidad == Dates.PASADO) {
            e.cellElement.css({
                "background-color": "rgb(229, 238, 235)"
            })
        } else if (e.column.temporalidad == Dates.PRESENTE) {
            e.cellElement.css({
                "background-color": "rgb(196, 250, 233)"
            })
        } else if (e.column.temporalidad == Dates.FUTURO) {
            e.cellElement.css({
                "background-color": "rgb(221, 247, 250)"
            })
        }
    }

    listOnDisposing(e) {
        this.saveState();
    }

    listOnContentReady(e) {
        this.refreshContextMenu()
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

    static PROMEDIO_WIDTH = 95;
    static VALORACION_WIDTH = 95;

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
            { dataField: "apellido", width: 150, allowReordering: false },
            { dataField: "nombre", width: (0 < this.periodosRows.length ? 150 : undefined), allowReordering: false }
        ]
    }

    periodosColumns() {

        const columns = []
        for (const row of this.periodosRows) {
            columns.push({
                name: "periodo_" + row.id,
                headerCellTemplate: row.nombre + Notas.TemporalidadDescripcion(row.temporalidad) + "<small><br>" + Dates.DesdeHasta(row.desde, row.hasta),
                caption: row.nombre,
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
        return [this.grupoPromedioValoracion({
                row: row,
                name: "preliminar",
                headerTemplate: "Informe Preliminar" + "<small><br>" + (Utils.IsDefined(row.preliminar) ? Dates.Format(row.preliminar) : "<i>(fecha no definida)"),
                caption: "Informe Preliminar"
            }),
            this.grupoPromedioValoracion({
                row: row,
                name: "promedio",
                caption: row.temporalidad == Dates.PASADO ? "Final" : "Proyectado",
            }),
            this.grupoStatus({
                row: row
            })
        ]
    }

    grupoPromedioValoracion(p) {
        return {
            name: p.name + "_" + p.row.id,
            caption: p.headerTemplate == undefined ? (p.caption || Strings.Capitalize(p.name)) : undefined,
            headerCellTemplate: p.headerTemplate,
            alignment: "center",
            temporalidad: p.row.temporalidad,
            visible: Utils.IsDefined(p.visible) ? p.visible : true,
            columns: [{
                    caption: "Promedio",
                    alignment: "center",
                    width: p.width || NotasColumns.PROMEDIO_WIDTH,
                    temporalidad: p.row.temporalidad,
                    allowSorting: true,
                    calculateCellValue: r => p.row.temporalidad != Dates.FUTURO ? r[p.name + "_" + p.row.id].promedio : ""
                },
                {
                    caption: "Valoración",
                    alignment: "center",
                    allowSorting: true,
                    width: p.width || NotasColumns.VALORACION_WIDTH,
                    temporalidad: p.row.temporalidad,
                    calculateCellValue: r => p.row.temporalidad != Dates.FUTURO ? r[p.name + "_" + p.row.id].valoracion : ""
                }
            ]
        }
    }

    grupoStatus(p) {
        return {
            dataField: "status_" + p.row.id,
            caption: "Status",
            temporalidad: p.row.temporalidad,
            alignment: "center",
            visible: true,
            columns: [{
                caption: "",
                temporalidad: p.row.temporalidad,
                alignment: "center",
                allowSorting: true,
                width: 150,
                calculateCellValue: r => p.row.temporalidad != Dates.FUTURO ? r["status_" + p.row.id].descripcion : ""
            }]
        }
    }

    anualColumn() {
        return [{
            name: "anual",
            caption: "Anual",
            alignment: "center",
            visible: true,
            columns: this.anualColumns(),
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
            const preliminares = this.notasData.alumnoPreliminares(row.id)
            const promedios = this.notasData.alumnoPromedios(row.id)
            const status = this.notasData.alumnoStatus(row.id, promedios);
            const anual = this.notasData.promedioTotal(promedios)
            rows.push(Object.assign({}, alumno, preliminares, promedios, status, anual))
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