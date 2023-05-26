class NotasValoraciones extends FilterViewBase {

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
                height: 600
            },
            components: {
                filter: {
                    width: 750,
                },
                list: {
                    keyExpr: "id",
                    columns: this.columns(),
                    dataSource: this.rows(),
                    toolbar: {
                        items: [this.itemExcel(), "searchPanel"]
                    },
                    groupPanel: {
                        visible: false
                    },
                    summary: {
                        totalItems: [
                            {
                                summaryType: "sum",
                                alignment: "left",
                                column: "porcentaje",
                                displayFormat: "{0}",
                                valueFormat: "percent",
                                alignment: "center"
                            },
                            {
                                summaryType: "sum",
                                alignment: "left",
                                column: "cantidad",
                                customizeText: data => data.value,
                                alignment: "center"
                            }]
                    }
                }
            }
        }
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
                dataField: "periodo",
                width: 250
            },
            {
                dataField: "valoracion",
                caption: "Valoración",
                alignment: "center",
                width: 100
            },
            {
                dataField: "porcentaje",
                caption: "Pct.",
                alignment: "center",
                width: 100,
                format: "### %"
            },
            {
                dataField: "cantidad",
                alignment: "center",
                width: 100
            },
            {

            }
        ]
    }

    rows() {
        let rows = []
        for (const periodoRow of this.periodosRows) {
            if (Dates.NoEsFuturo(periodoRow.temporalidad)) {
                rows = rows.concat(this.periodoRows(periodoRow))
            }
        }
        return rows;
    }

    periodoRows(periodoRow) {
        const rows = []
        for (const valoracionRow of this.valoracionesRows) {
            const cantidadPorcentaje = this.siglaCantidadPorcentaje(periodoRow.id, valoracionRow.sigla)
            rows.push({
                id: periodoRow.id + "_" + valoracionRow.sigla,
                periodo: periodoRow.nombre,
                valoracion: valoracionRow.sigla,
                cantidad: (0 < cantidadPorcentaje.cantidad ? cantidadPorcentaje.cantidad : ""),
                porcentaje: (0 < cantidadPorcentaje.porcentaje ? cantidadPorcentaje.porcentaje / 100 : "")
            })
        }
        return rows;
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

}