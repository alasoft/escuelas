class NotasBase extends FilterViewBase {

    static COLOR_PASADO = {
        "background-color": "rgb(229, 238, 235)"
    }

    static COLOR_PRESENTE = {
        "background-color": "rgb(196, 250, 233)"
    }

    static COLOR_FUTURO = {
        "background-color": "rgb(221, 247, 250)"
    }

    static COLOR_ANUAL = {
        "background-color": "rgb(242, 232, 248)"
    }

    static TemporalidadDescripcion(t) {
        if (t == Dates.PASADO) {
            return " / Cerrado"
        } else if (t == Dates.PRESENTE) {
            return " / Vigente"
        } else {
            return " / Futuro"
        }
    }

    static NotaEditor(cellElement, cellInfo) {
        return $("<div>").dxNumberBox({
            value: cellInfo.value,
            min: 1,
            max: 10,
            showSpinButtons: true,
            onValueChanged: e => cellInfo.setValue(e.value)
        })
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            fullScreen: false,
            components: {
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
                    onCellPrepared: e => this.listOnCellPrepared(e)
                }
            }
        })
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

    añoLectivo() {
        return this.getFilterValue("añolectivo");
    }

    curso() {
        return this.getFilterValue("curso")
    }

    materiaCurso() {
        return this.getFilterValue("materiacurso")
    }

    loadCursos() {
        if (this.filter().isReady() && this.añoLectivo() != undefined) {
            new Rest({ path: "cursos" })
                .promise({
                    verb: "list",
                    data: { añolectivo: this.añoLectivo() }
                }).then(rows =>
                    this.filter().setArrayDataSource(
                        "curso", rows, this.settingState == true ? this.state.filter.curso : undefined)
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
                })
                .then(rows => {
                    this.filter().setArrayDataSource(
                        "materiacurso", rows, this.settingState == true ? this.state.filter.materiaCurso : undefined);
                })
                .then(() =>
                    this.clearSettingState())
        } else {
            this.filter().clearEditorDataSource("materiacurso");
            this.clearSettingState()
        }
    }

    notasData() {
        if (this._notasData == undefined) {
            this._notasData = new NotasData()
        }
        return this._notasData;
    }

    refresh() {
        return this.notasData().refresh(this.materiaCurso())
            .then(() =>
                this.refreshListToolbar())
            .then(() =>
                this.list().resetColumns(this.columns()))
            .then(() =>
                this.setColumnsVisibility())
            .then(() =>
                this.list().setArrayDataSource(this.rows()))
            .then(() =>
                this.list().focus())
            .catch(err =>
                this.handleError(err))
    }

    handleError(err) {
        throw err;
    }

    refreshRows() {
        this.list().setArrayDataSource(this.rows())
    }

    setColumnsVisibility() {
        if (this.state.list != undefined) {
            this.list().setColumnsVisibility(this.state.list.columnsVisibility)
        }
    }

    columns() {}

    rows() {}

    getState() {
        return {
            filter: {
                añoLectivo: this.getFilterValue("añolectivo"),
                curso: this.getFilterValue("curso"),
                materiaCurso: this.getFilterValue("materiacurso"),
            },
            list: {
                state: this.list().getState(),
                columnsVisibility: this.getColumnsVisibility()
            }
        }
    }

    setState() {
        this.settingState = true;
        this.setFilterValue("añolectivo", Utils.IfDefined(this.state.filter.añoLectivo) ?
            this.state.filter.añoLectivo : Dates.ThisYear()
        )
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

    alumnos() {
        new AlumnosCurso({
                mode: "popup",
                isDetail: true,
                añoLectivo: this.añoLectivo(),
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

    periodos() {
        new Periodos({
                mode: "popup",
                añoLectivoReadOnly: true,
                cursoReadOnly: true
            })
            .render().then(closeData =>
                this.afterPeriodos(closeData))
    }


    afterPeriodos(closeData) {
        if (closeData.dataHasChanged == true) {
            this.refresh()
        }
    }

    examenes() {
        new ExamenesCurso({
                mode: "popup",
                isDetail: true,
                añoLectivo: this.añoLectivo(),
                curso: this.curso(),
                materiaCurso: this.materiaCurso(),
                añoLectivoReadOnly: true,
                cursoReadOnly: true,
                materiaCursoReadOnly: true,

            }).render()
            .then(closeData =>
                this.afterExamenes(closeData))
    }

    afterExamenes(closeData) {
        if (closeData.dataHasChanged == true) {
            this.refresh()
        }
    }

    cursoDescripcion() {
        return this.getFilterText("curso") + " / " + this.getFilterValue("añolectivo")
    }

    materiaDescripcion() {
        return this.getFilterText("materiacurso")
    }

    alumno() {
        return this.row("id")
    }

    alumnoDescripcion() {
        return this.row("apellido") + ", " + this.row("nombre")
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
        if (e.column.temporalidad == Dates.PASADO) {
            e.cellElement.css(this.class().COLOR_PASADO)
        } else if (e.column.temporalidad == Dates.PRESENTE) {
            e.cellElement.css(this.class().COLOR_PRESENTE)
        } else if (e.column.temporalidad == Dates.FUTURO) {
            e.cellElement.css(this.class().COLOR_FUTURO)
        } else if (e.column.esAnual == true) {
            e.cellElement.css(this.class().COLOR_ANUAL)
        }
    }

}

class NotasColumnsBase {

    static PROMEDIO_WIDTH = 95;
    static VALORACION_WIDTH = 95;

    constructor(notas) {
        this.notas = notas;
        this.notasData = this.notas.notasData();
        this.periodosRows = this.notasData.periodosRows;
        this.examenesRows = this.notasData.examenesRows;
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
            { dataField: "apellido", width: 150, allowReordering: false, allowEditing: false },
            { dataField: "nombre", width: (0 < this.periodosRows.length ? 150 : undefined), allowReordering: false, allowEditing: false }
        ]
    }

    periodosColumns() {
        const columns = []
        for (const periodoRow of this.periodosRows) {
            columns.push({
                name: "periodo_" + periodoRow.id,
                headerCellTemplate: periodoRow.nombre + NotasBase.TemporalidadDescripcion(periodoRow.temporalidad) + "<small><br>" + Dates.DesdeHasta(periodoRow.desde, periodoRow.hasta),
                caption: periodoRow.nombre,
                alignment: "center",
                temporalidad: periodoRow.temporalidad,
                columns: this.periodoColumns(periodoRow),
                allowReordering: false,
                allowResizing: true
            })
        }
        return columns;
    }

    grupoPromedioValoracion(p) {
        return {
            name: p.name + "_" + p.periodoRow.id,
            caption: p.headerTemplate == undefined ? (p.caption || Strings.Capitalize(p.name)) : undefined,
            headerCellTemplate: p.headerTemplate,
            alignment: "center",
            temporalidad: p.periodoRow.temporalidad,
            visible: Utils.IsDefined(p.visible) ? p.visible : true,
            columns: [{
                    caption: "Promedio",
                    alignment: "center",
                    width: p.width || NotasColumns.PROMEDIO_WIDTH,
                    temporalidad: p.periodoRow.temporalidad,
                    allowSorting: true,
                    calculateCellValue: r => p.periodoRow.temporalidad != Dates.FUTURO ? r[p.name + "_" + p.periodoRow.id].promedio : ""
                },
                {
                    caption: "Valoración",
                    alignment: "center",
                    allowSorting: true,
                    width: p.width || NotasColumns.VALORACION_WIDTH,
                    temporalidad: p.periodoRow.temporalidad,
                    calculateCellValue: r => p.periodoRow.temporalidad != Dates.FUTURO ? r[p.name + "_" + p.periodoRow.id].valoracion : ""
                }
            ]
        }
    }

    grupoStatus(p) {
        return {
            dataField: "status_" + p.periodoRow.id,
            caption: "Status",
            temporalidad: p.periodoRow.temporalidad,
            alignment: "center",
            visible: true,
            columns: [{
                caption: "",
                temporalidad: p.periodoRow.temporalidad,
                allowSorting: true,
                width: 150,
                calculateCellValue: r => p.periodoRow.temporalidad != Dates.FUTURO ? r["status_" + p.periodoRow.id].descripcion : ""
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

    emptyColumn(periodoRow) {
        return {
            temporalidad: Utils.IsDefined(periodoRow) ? periodoRow.temporalidad : undefined
        }
    }

}

class NotasRowsBase {

    constructor(notas) {
        this.notas = notas;
        this.notasData = this.notas.notasData();
        this.alumnosRows = this.notasData.alumnosRows;
    }

}