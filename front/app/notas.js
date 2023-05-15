class Notas extends NotasBase {

    extraConfiguration() {
        return {
            fullScreen: true,
            components: {
                label: {
                    text: "Notas por Curso y Materia"
                },
                list: {
                    pager: {
                        visible: false
                    },
                    paging: {
                        pageSize: 50
                    },
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    onRowUpdating: e => this.listOnRowUpdating(e)
                },
            }
        }
    }

    contextMenuItems() {
        return [this.contextItemNotasAlumno(),
            this.contextItemMuestraExamenes(),
            this.contextItemVisualizaColumnas(),
            this.contextItemExcelExport()
        ]
    }

    contextItemNotasAlumno() {
        return {
            text: "Notas por Alumno",
            onClick: e => this.notasAlumno(),
        }
    }

    contextItemMuestraExamenes() {
        const examenesVisibles = this.examenesVisibles();
        return {
            text: examenesVisibles ? "Oculta Examenes" : "Muestra Examenes",
            onClick: e => this.muestraExamenes(!examenesVisibles)
        }
    }

    examenesVisibles() {
        if (this.notasData().periodosRows != undefined) {
            for (const periodoRow of this.notasData().periodosRows) {
                if (this.list().isColumnVisible("examenes_" + periodoRow.id)) {
                    return true;
                }
            }
        }
        return false;
    }

    muestraExamenes(visible = true) {
        for (const periodoRow of this.notasData().periodosRows) {
            this.list().showColumn("examenes_" + periodoRow.id, visible)
        }
        this.state.list.visibleColumns = this.getVisibleColumns();
    }

    contextItemVisualizaColumnas() {
        return {
            text: "Visualiza Columnas",
            onClick: e => this.visualizaColumnas()
        }
    }

    columns() {
        return new NotasColumns(this).columns();
    }

    rows() {
        return new NotasRows(this).rows()
    }

    listToolbarItems() {
        return [this.itemPeriodos(), this.itemAlumnos(), this.itemExamenes(), this.itemVisualiza(),
            this.itemExcel(), "searchPanel"
        ]
    }

    columnaPeriodoVisible(periodo) {
        return this.isColumnVisible("periodo_" + periodo);
    }

    columnaNotasVisible(periodo) {
        return this.isColumnVisible("examenes_" + periodo)
    }

    columnaPreliminarVisible(periodo) {
        return this.isColumnVisible("preliminar_" + periodo);
    }

    columnaStatusVisible(periodo) {
        return this.isColumnVisible("status_" + periodo);
    }

    columnaAnualVisible() {
        return this.list().isColumnVisible("anual");
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
                hint: "Selecciona columnas a visualizar",
                onClick: e => this.visualizaColumnas()
            }
        }
    }

    excelFileName() {
        return "Notas del Curso: " + this.materiaCursoDescripcion()
    }

    excelDialogWidth() {
        return 800
    }

    materiaCursoDescripcion() {
        return this.getFilterText("curso") + " / " + this.getFilterText("materiaCurso") +
            " / " + this.getFilterText("añoLectivo")
    }

    excelExport(p) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Notas", {
            pageSetup: { fitToWidth: 1, fitToHeight: 0, paperSize: 9, scale: 70 }
        });

        DevExpress.excelExporter.exportDataGrid({
                component: this.list().instance(),
                worksheet: worksheet,
                autoFilterEnabled: false,
                topLeftCell: { row: 4, column: 1 }
            })
            .then(cellRange => {

                worksheet.properties.outlineProperties = null;

                const titleRow = worksheet.getRow(1);
                const subTitleRow = worksheet.getRow(2);

                /*                
                                titleRow.fill = {
                                    type: 'pattern',
                                    pattern: 'solid',
                                    fgColor: {
                                        argb: 'D0F9E7'
                                    }
                                };
                */

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

    visualizaColumnas() {
        new NotasVisualizaColumnas({ notas: this }).render().then(closeData => {
            this.state.list.visibleColumns = this.getVisibleColumns()
        })
    }

    updateNota(e) {
        const parameters = this.saveNotaParameters(e)
        this.notasData().saveNota(parameters.examen, parameters.alumno, parameters.nota);
        const totalesRow = this.notasData().alumnoTotalesRow(parameters.alumno, true);
        if (parameters.nota == null) {
            totalesRow["examen_" + parameters.examen] = null;
        }
        e.newData = totalesRow;
        this.saveNota(parameters);

    }

    saveNotaParameters(e) {
        const notaProperty = Object.keys(e.newData)[0];
        const nota = e.newData[notaProperty];
        const notaAnterior = e.oldData[notaProperty];
        const examen = Strings.After(notaProperty, "_");
        return { alumno: this.alumno(), examen, nota, notaAnterior };
    }

    saveNota(p) {
        new Rest({ path: "notas" }).promise({
                verb: "update",
                data: {
                    examen: p.examen,
                    alumno: p.alumno,
                    nota: p.nota
                }
            })
            .then(() =>
                this.dataHasChanged = true)
            .catch(err =>
                this.saveNotaHandleError(err, p))
    }


    listOnRowDblClick(e) {
        if (this.list().hasRows()) {
            this.notasAlumno();
        }
    }

    listOnRowUpdating(e) {
        this.updateNota(e)
    }

    contextOnPositioning(e) {
        this.contextMenu().setItems(this.contextMenuItems())
    }

}

class NotasColumns extends NotasColumnsBase {}

class NotasRows extends NotasRowsBase {}