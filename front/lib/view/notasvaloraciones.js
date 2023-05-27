class NotasValoraciones extends FilterViewBase {

    static COLOR_PRESENTE = {
        "background-color": "rgb(198, 238, 251)"        
    }

    static COLOR_TOTAL = {
        "background-color": "rgb(238, 240, 236)"
    }

    constructor(parameters) {
        super(parameters);
        this.notas = parameters.notas;
        this.notasRows = this.notas.rows();
        this.notasData = this.notas.notasData();
        this.valoracionesRows = this.notasData.valoracionesRows;
        this.periodosRows = this.notasData.periodosRows;
        this.alumnosRows = this.notasData.alumnosRows;
    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Valoraciones Porcentuales",
                width: 900,
                height: 500
            },
            components: {
                filter: {
                    width: 750,
                    height: 50
                },
                list: {
                    keyExpr: "id",
                    focusedRowEnabled: false,
                    columns: this.columns(),
                    dataSource: this.rows(),
                    showBorders: true,
                    wordWrapEnabled: true,
                    hoverStateEnabled: true,
                    toolbar: {
                        items: [this.itemExcel()]
                    },
                    groupPanel: {
                        visible: false
                    },
                    summary: {
                        totalItems: this.totalItems()
                    },
                    onCellPrepared: e => this.listOnCellPrepared(e)
                }
            }
        }
    }

    totalItems() {
        const items = []
        for (const periodoRow of this.periodosRows) {
            if (Dates.NoEsFuturo(periodoRow.temporalidad)) {
                items.push({
                    summaryType: "sum",
                    alignment: "left",
                    column: "porcentaje_" + periodoRow.id,
                    displayFormat: "{0}",
                    valueFormat: "percent",
                    alignment: "center"
                })
                items.push({
                    summaryType: "sum",
                    alignment: "left",
                    column: "cantidad_" + periodoRow.id,
                    customizeText: data => data.value,
                    alignment: "center"
                })
            }
        }
        return items;
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 7,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso(),
                    this.itemCursoMateria()
                ]
            }),
        ]
    }

    itemAñoLectivo(p) {
        return Item.ReadOnly(
            {
                value: this.notas.añoLectivo(),
                width: 100,
                label: "Año Lectivo",
            })
    }

    itemCurso(p) {
        return Item.ReadOnly(
            {
                value: this.notas.cursoDescripcion(),
                width: 400,
                label: "Curso",
                colSpan: 4,
            })
    }

    itemCursoMateria() {
        return Item.ReadOnly({
            value: this.notas.materiaCursoDescripcion(),
            width: 200,
            label: "Materia",
            colSpan: 3,
        })

    }

    columns() {
        return [
            {
                dataField: "id",
                visible: false
            },
            {
                dataField: "valoracion",
                caption: "Valoración",
                width: 250
            },
        ].concat(this.periodosColumns()).concat({})
    }

    periodosColumns() {
        const columns = [];
        for (const periodoRow of this.periodosRows) {
            if (Dates.NoEsFuturo(periodoRow.temporalidad)) {
                columns.push(this.periodoColumns(periodoRow))
            }
        }
        return columns;
    }

    periodoColumns(periodoRow) {
        return {
            dataField: "periodo_" + periodoRow.id,
            headerCellTemplate: periodoRow.nombre + Periodos.TemporalidadDescripcion(periodoRow.temporalidad) + "<small><br>" + Dates.DesdeHasta(periodoRow.desde, periodoRow.hasta),
            caption: periodoRow.nombre,
            alignment: "center",
            temporalidad: periodoRow.temporalidad,
            esValor: true,
            columns: this.periodoSubColumns(periodoRow)
        }
    }

    periodoSubColumns(periodoRow) {
        return [
            {
                dataField: "porcentaje_" + periodoRow.id,
                caption: "Pct.",
                alignment: "center",
                width: 100,
                format: "### %",
                esValor: true,
                temporalidad: periodoRow.temporalidad
            },
            {
                dataField: "cantidad_" + periodoRow.id,
                caption: "Cantidad",
                alignment: "center",
                width: 100,
                esValor: true,
                temporalidad: periodoRow.temporalidad
            }
        ]
    }

    rows() {
        let rows = []
        for (const valoracionRow of this.valoracionesRows) {
            rows.push(this.valoracionRow(valoracionRow))
        }
        return rows;
    }

    valoracionRow(valoracionRow) {
        const row = {
            id: valoracionRow.id,
            valoracion: valoracionRow.sigla + " / " + valoracionRow.nombre,
        }
        for (const periodoRow of this.periodosRows) {
            const cantidadPorcentaje = this.siglaCantidadPorcentaje(periodoRow.id, valoracionRow.sigla)
            row["cantidad_" + periodoRow.id] = (0 < cantidadPorcentaje.cantidad ? cantidadPorcentaje.cantidad : "");
            row["porcentaje_" + periodoRow.id] = (0 < cantidadPorcentaje.porcentaje ? cantidadPorcentaje.porcentaje / 100 : "")
        }
        return row;
    }

    siglaCantidadPorcentaje(periodo, sigla) {
        let cantidad = 0;
        for (const notaRow of this.notasRows) {
            if (notaRow["promedio_valoracion_" + periodo] == sigla) {
                ++cantidad;
            }
        }
        let porcentaje = (cantidad / this.alumnosRows.length) * 100
        return { cantidad, porcentaje }
    }

    listOnCellPrepared(e) {
        if (Dates.NoEsFuturo(e.column.temporalidad) && e.column.esValor == true) {
            if(e.rowType != "totalFooter"){
                e.cellElement.css(this.class().COLOR_PRESENTE)
            } else {
                e.cellElement.css(this.class().COLOR_TOTAL)
            }
        }
    }

}