class Notas extends NotasBase {

    extraConfiguration() {
        return {
            components: {
                label: {
                    text: "Notas por Curso y Materia"
                },
                list: {
                    onKeyDown: e => this.listOnKeyDown(e),
                    onRowDblClick: e => this.listOnRowDblClick(e),
                }
            }
        }
    }

    contextMenuItems() {
        return [this.contextItemNotasAlumno(), this.contextItemNotasExamenes(), this.contextItemExporta(), this.contextItemVisualiza()]
    }

    contextItemNotasAlumno() {
        return {
            text: "Notas por Alumno",
            onClick: e => this.notasAlumno(),
        }
    }

    contextItemNotasExamenes() {
        return {
            text: "Notas por Examen",
            onClick: e => this.notasExamenes(),
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
            for (const periodoRow of this.notasData().periodosRows) {
                addState(this, "periodo_" + periodoRow.id)
                addState(this, "preliminar_" + periodoRow.id)
                addState(this, "status_" + periodoRow.id)
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

    notasExamenes() {
        new NotasExamenes().render()
    }

    visualiza() {
        new NotasVisualiza({ notas: this }).render().then(closeData =>
            this.state.visibleColumns = this.getStateVisibleColumns())
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

class NotasColumns extends NotasColumnsBase {

    periodoColumns(periodoRow) {
        return [this.grupoPromedioValoracion({
                periodoRow: periodoRow,
                name: "preliminar",
                caption: "Informe Preliminar",
                headerTemplate: "Informe Preliminar" + "<small><br>" + (Utils.IsDefined(periodoRow.preliminar) ? Dates.Format(periodoRow.preliminar) : "<i>(fecha no definida)"),
            }),
            this.grupoPromedioValoracion({
                periodoRow: periodoRow,
                name: "promedio",
                caption: periodoRow.temporalidad == Dates.PASADO ? "Final" : "Proyectado",
            }),
            this.grupoStatus({
                periodoRow: periodoRow
            })
        ]
    }

}

class NotasRows extends NotasRowsBase {

    rows() {
        const rows = [];
        for (const alumnoRow of this.alumnosRows) {
            const alumno = { id: alumnoRow.id, apellido: alumnoRow.apellido, nombre: alumnoRow.nombre };
            const preliminares = this.notasData.alumnoPreliminares(alumnoRow.id)
            const promedios = this.notasData.alumnoPromedios(alumnoRow.id)
            const status = this.notasData.alumnoStatus(alumnoRow.id, promedios);
            const anual = this.notasData.promedioTotal(promedios)
            rows.push(Object.assign({}, alumno, preliminares, promedios, status, anual))
        }
        return rows;
    }

}