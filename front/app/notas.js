class Notas extends NotasBase {

    extraConfiguration() {
        return {
            components: {
                label: {
                    text: "Notas por Curso y Materia"
                },
                list: {
                    onCellPrepared: e => this.listOnCellPrepared(e),
                    onKeyDown: e => this.listOnKeyDown(e),
                    onRowDblClick: e => this.listOnRowDblClick(e),
                },
            }
        }
    }

    contextMenuItems() {
        return [this.contextItemNotasAlumno(), this.contextItemExporta(), this.contextItemVisualiza()]
    }

    contextItemNotasAlumno() {
        return {
            text: "Notas del Alumno",
            onClick: e => this.notasAlumno(),
        }
    }

    contextItemVisualiza() {
        return {
            text: "Visualiza Columnas",
            onClick: e => this.visualiza()
        }
    }

    columns() {
        return new NotasColumns(this).columns();
    }

    rows() {
        return new NotasRows(this).rows()
    }

    listToolbarItems() {
        return [this.itemPeriodos(), this.itemAlumnos(), this.itemExamenes(), this.itemVisualiza(), this.itemExcel(), "searchPanel"]
    }

    columnaPeriodoVisible(id) {
        return this.isColumnVisible("periodo_" + id);
    }

    columnaPreliminarVisible(id) {
        return this.isColumnVisible("preliminar_" + id);
    }

    columnaStatusVisible(id) {
        return this.isColumnVisible("status_" + id);
    }

    columnaAnualVisible() {
        return this.list().isColumnVisible("anual");
    }

    getColumnsVisibility() {

        function addState(notas, nombre) {
            state[nombre] = notas.isColumnVisible(nombre)
        }

        const state = {};

        if (this.notasData().periodosRows != undefined) {
            for (const row of this.notasData().periodosRows) {
                addState(this, "periodo_" + row.id)
                addState(this, "preliminar_" + row.id)
                addState(this, "status_" + row.id)
            }
        }

        addState(this, "anual")

        return state;

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
        new ExportExcelDialog({ fileName: this.excelFileName(), width: 800 }).render()
            .then(data => {
                if (data.okey) {
                    this.exportExcel({
                        e: e,
                        fileName: this.excelFileName(),
                        title: "Notas de la Materia",
                        subTitle: this.materiaCursoDescripcion(),
                    })
                }
            })
    }

    excelFileName() {
        return "Notas del Curso: " + this.materiaCursoDescripcion()
    }

    materiaCursoDescripcion() {
        return this.getFilterText("curso") + " / " + this.getFilterText("materiacurso") +
            " / " + this.getFilterText("añolectivo")
    }

    exportExcel(p) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(p.fileName);

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
                worksheet.mergeCells(1, 1, 1, this.list().columnCount() - 1);
                worksheet.mergeCells(2, 1, 2, this.list().columnCount() - 1);

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

    visualiza() {
        new NotasVisualiza({ notas: this }).render().then(closeData =>
            this.state.visibleColumns = this.getStateVisibleColumns())
    }

    listOnCellPrepared(e) {
        if (e.column.temporalidad == Dates.PASADO) {
            e.cellElement.css(Notas.COLOR_PASADO)
        } else if (e.column.temporalidad == Dates.PRESENTE) {
            e.cellElement.css(Notas.COLOR_PRESENTE)
        } else if (e.column.temporalidad == Dates.FUTURO) {
            e.cellElement.css(Notas.COLOR_FUTURO)
        } else if (e.column.esAnual == true) {
            e.cellElement.css(Notas.COLOR_ANUAL)
        }
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
                caption: "Informe Preliminar",
                //                headerTemplate: "Informe Preliminar" + "<small><br>" + (Utils.IsDefined(row.preliminar) ? Dates.Format(row.preliminar) : "<i>(fecha no definida)"),
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
                allowSorting: true,
                width: 150,
                calculateCellValue: r => p.row.temporalidad != Dates.FUTURO ? r["status_" + p.row.id].descripcion : ""
            }]
        }
    }

    anualColumn() {
        return [{
            name: "anual",
            esAnual: true,
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
                esAnual: true,
                alignment: "center",
                width: 80,
                calculateCellValue: r => r.total.promedio
            },
            {
                dataField: "valoracion_anual",
                caption: "Valoración",
                esAnual: true,
                alignment: "center",
                width: 90,
                calculateCellValue: r => r.total.valoracion
            }
        ]

    }

    emptyColumn() {
        return {}
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