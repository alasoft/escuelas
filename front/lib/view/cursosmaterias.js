class CursosMaterias extends FilterViewBase {


    static COLOR_PRESENTE = {
        "background-color": "rgb(198, 238, 251)"
    }

    static COLOR_FUTURO = {
        "background-color": "rgb(245, 248, 249)"
    }

    static COLOR_ANUAL = {
        "background-color": "rgb(242, 232, 248)"
    }

    constructor(parameters) {
        super(parameters);
        this.notas = parameters.notas;
    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Cursos y Materias"
            },
            components: {
                filter: {
                    labelLocation: "left",
                    height: 50
                },
                list: {
                    wordWrapEnabled: true,
                    headerFilter: {
                        visible: false
                    },
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    //                    onCellPrepared: e => this.listOnCellPrepared(e)
                }
            }
        }
    }

    filterItems() {
        return [this.itemAñoLectivo()]
    }

    itemAñoLectivo(p) {
        return Item.ReadOnly(
            {
                dataField: "añoLectivo",
                value: this.notas.añoLectivo(),
                width: 100,
                label: "Año Lectivo",
            })
    }

    añoLectivo() {
        return this.getFilterValue("añoLectivo");
    }

    refresh() {
        return this.cursosMateriasData().refresh(this.añoLectivo())
            .then(() =>
                this.list().setColumns(this.columns()))
            .then(() =>
                this.list().setState(this.state.list))
            .then(() =>
                this.list().setArrayDataSource(this.rows()))
            .catch(err =>
                this.handleError(err))
    }

    cursosMateriasData() {
        if (this._cursosMateriasData == undefined) {
            this._cursosMateriasData = new CursosMateriasData();
        }
        return this._cursosMateriasData;
    }

    columns() {
        return this.fixedColumns().concat(this.periodosColumns(), this.emptyColumn())
    }

    fixedColumns() {
        return [
            {
                dataField: "id",
                visible: false
            },
            {
                dataField: "escuelanombre",
                caption: "Escuela",
                visible: false
            },
            {
                dataField: "cursoDescripcion",
                caption: "Curso",
                width: 350
            },
            {
                dataField: "materianombre",
                caption: "Materia",
                allowResizing: true,
                width: 150
            },
            {
                dataField: "alumnosCantidad",
                caption: "Cantidad Alumnos",
                alignment: "center",
                width: 100,
                visible: false
            }
        ]

    }

    periodosColumns() {
        const data = this.cursosMateriasData();
        const periodosRows = data.periodosRows;
        const columns = [];
        for (const periodoRow of periodosRows) {
            if (Dates.NoEsFuturo(periodoRow.temporalidad)) {
                columns.push({
                    name: "periodo_" + periodoRow.id,
                    headerCellTemplate: periodoRow.nombre + Periodos.TemporalidadDescripcion(periodoRow.temporalidad) + "<small><br>" + Dates.DesdeHasta(periodoRow.desde, periodoRow.hasta),
                    caption: periodoRow.nombre,
                    alignment: "center",
                    temporalidad: periodoRow.temporalidad,
                    allowReordering: true,
                    allowResizing: true,
                    allowSorting: true,
                    width: 350,
                    columns: this.periodoColumns(periodoRow)
                })
            }
        }
        return columns
    }

    periodoColumns(periodoRow) {
        return [
            this.promedioColumn(periodoRow),
            this.statusColumn(periodoRow)
        ]
    }

    promedioColumn(periodoRow) {
        return {
            dataField: "promedio_" + periodoRow.id,
            caption: "Promedio Curso",
            temporalidad: periodoRow.temporalidad,
            allowSorting: true,
            alignment: "center",
            visible: false,
            width: 100,
        }
    }

    statusColumn(periodoRow) {
        return {
            dataField: "status_" + periodoRow.id,
            caption: "Status",
            temporalidad: periodoRow.temporalidad,
            allowSorting: true,
            width: 200,
        }
    }

    emptyColumn(periodoRow, width) {
        return {
            temporalidad: Utils.IsDefined(periodoRow) ? periodoRow.temporalidad : undefined,
            width: width
        }
    }

    rows() {
        const data = this.cursosMateriasData();
        const cursosMateriasRows = data.cursosMateriasRows;
        const rows = [];
        for (const cursoMateriaRow of cursosMateriasRows) {
            rows.push(Object.assign({}, cursoMateriaRow))
        }
        return rows;
    }

    getState() {
        return {
            filter: {
                añoLectivo: this.getFilterValue("añoLectivo"),
            },
            list: this.list().getState()
        }
    }

    setState() {
        return this.refresh()
    }

    itemAñoLectivoOnValueChanged(e) {
        if (this.settingState != true) {
            this.refresh();
        }
    }

    listOnCellPrepared(e) {
        if (e.column.temporalidad == Dates.PRESENTE) {
            e.cellElement.css(this.class().COLOR_PRESENTE)
        } else if (e.column.temporalidad == Dates.FUTURO) {
            e.cellElement.css(this.class().COLOR_FUTURO)
        } else if (e.column.esAnual == true) {
            e.cellElement.css(this.class().COLOR_ANUAL)
        }
    }

    listOnRowDblClick(e) {
        this.close({ curso: this.curso(), materiaCurso: this.materiaCurso() })
    }

    curso() {
        return this.rowValue("cursoid")
    }

    materiaCurso() {
        return this.rowValue("materiacurso")
    }


}