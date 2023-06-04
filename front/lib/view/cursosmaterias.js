class CursosMaterias extends FilterViewBase {

    static STATUS_NO_HAY_MATERIAS = 0;
    static STATUS_NO_HAY_EXAMENES = 1;
    static STATUS_FALTAN_CARGA_NOTAS = 2;
    static STATUS_AL_DIA = 3;
    static STATUS_COMPLETO = 4;

    static COLOR_NO_HAY_MATERIAS = {
        "background-color": "rgb(232, 233, 225)"
    }

    static COLOR_NO_HAY_EXAMENES = {
        "background-color": "rgb(232, 240, 250 )"
    }

    static COLOR_FALTAN_CARGAR_NOTAS = {
        "background-color": "rgb(248, 249, 204)"
    }

    static COLOR_AL_DIA = {
        "background-color": "rgb(200, 245, 220)"
    }

    static COLOR_COMPLETO = {
        "background-color": "rgb(220, 247, 198)"
    }

    static Colores = new Map()
        .set(this.STATUS_NO_HAY_MATERIAS, this.COLOR_NO_HAY_MATERIAS)
        .set(this.STATUS_NO_HAY_EXAMENES, this.COLOR_NO_HAY_EXAMENES)
        .set(this.STATUS_FALTAN_CARGA_NOTAS, this.COLOR_FALTAN_CARGAR_NOTAS)
        .set(this.STATUS_AL_DIA, this.COLOR_AL_DIA)
        .set(this.STATUS_COMPLETO, this.COLOR_COMPLETO)

    constructor(parameters) {
        super(parameters);
        this.notas = parameters.notas;
    }

    defineTemplate() {
        return new CursosMateriasTemplate()
    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Situación de Cursos y Materias Dictadas",
                height: 700
            },
            components: {
                filter: {
                    labelLocation: "left",
                    height: 30
                },
                list: {
                    keyExpr: "id",
                    focusedRowEnabled: false,
                    wordWrapEnabled: true,
                    headerFilter: {
                        visible: false
                    },
                    groupPanel: {
                        visible: true
                    },
                    summary: {
                        totalItems: [
                            {
                                summaryType: "sum",
                                alignment: "left",
                                column: "alumnosCantidad",
                                displayFormat: "{0}",
                                alignment: "center"
                            },
                            {
                                name: "totalMaterias",
                                summaryType: "custom",
                                alignment: "left",
                                column: "materianombre",
                                displayFormat: "{0}",
                                alignment: "center"
                            }
                        ],
                        calculateCustomSummary: options =>
                            this.calculateCustomSummary(options)
                    },
                    toolbar: {
                        items: [this.itemExcel()]
                    },
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    onCellPrepared: e => this.listOnCellPrepared(e)
                },
                toolbar: {}
            },
            excelFileName: () => "Situación de Cursos y Materias Dictadas / " + this.añoLectivo()
        }
    }

    calculateCustomSummary(options) {
        if (options.name == "totalMaterias") {
            if (options.summaryProcess == "start") {
                options.totalValue = 0;
            } else if (options.summaryProcess == "calculate") {
                if (options.value != "")
                    options.totalValue += 1;
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

    toolbar() {
        return this.components().toolbar;
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

    refreshToolbar() {
        if (this.toolbar().isReady()) {
            this.toolbar().setItems(this.toolbarItems())
        }
    }

    toolbarItems() {
        return [{
            widget: "dxButton",
            location: "before",
            options: {
                template: "<div>Seleccione Curso/Materia con 'doble-click'<div>"
            }
        }]
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
                width: 400
            },
            {
                dataField: "alumnosCantidad",
                caption: "Alumnos",
                alignment: "center",
                width: 100,
                visible: true
            },
            {
                dataField: "materianombre",
                caption: "Materia Dictada",
                allowResizing: true,
                width: 150
            },
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
            this.statusCodeColumn(periodoRow),
            this.statusTextColumn(periodoRow)
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

    statusCodeColumn(periodoRow) {
        return {
            dataField: "status_code_" + periodoRow.id,
            visible: false,
        }
    }

    statusTextColumn(periodoRow) {
        return {
            dataField: "status_text_" + periodoRow.id,
            caption: "Status",
            temporalidad: periodoRow.temporalidad,
            allowSorting: true,
            width: 200,
            esStatus: true,
            periodo: periodoRow.id,
            calculateSortValue: row => row["status_code_" + periodoRow.id]
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

    listOnContentReady(e) {
        this.refreshContextMenu();
        this.refreshToolbar()
    }

    listOnCellPrepared(e) {
        if (e.rowType == "data" && e.column.esStatus == true) {
            e.cellElement.css(CursosMaterias.Colores.get(e.data["status_code_" + e.column.periodo]))
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

class CursosMateriasTemplate extends FilterViewBaseTemplate {

    mainItems() {
        return super.mainItems().concat([{
            name: "toolbar"
        }])
    }

}