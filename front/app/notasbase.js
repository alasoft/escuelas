class NotasBase extends FilterViewBase {

    static COLOR_NOTA_EDITABLE = {
        "background-color": "rgb(200, 245, 220)"
    }

    static COLOR_NOTA_NO_EDITABLE = {
        //        "background-color": "rgb(208, 249, 231  )"
        "background-color": "rgb(200, 245, 220)"
    }

    static COLOR_PRESENTE = {
        "background-color": "rgb(198, 238, 251)"
    }

    static COLOR_FUTURO = {
        "background-color": "rgb(245, 248, 249)"
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
            dataField: "añoLectivo",
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
            dataField: "materiaCurso",
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
        return this.getFilterValue("añoLectivo");
    }

    curso() {
        return this.getFilterValue("curso")
    }

    materiaCurso() {
        return this.getFilterValue("materiaCurso")
    }

    loadCursos(curso) {
        if (this.filter().isReady() && this.añoLectivo() != undefined) {
            return new Rest({ path: "cursos" })
                .promise({
                    verb: "list",
                    data: { añolectivo: this.añoLectivo() }
                }).then(rows =>
                    this.filter().setArrayDataSource(
                        "curso", rows, curso)
                )
        } else {
            this.filter().clearEditorDataSource("curso");
        }
    }

    loadMateriasCursos(materiaCurso) {
        if (this.curso() != undefined) {
            return new Rest({ path: "materias_cursos" })
                .promise({
                    verb: "list",
                    data: { curso: this.curso() }
                })
                .then(rows => {
                    this.filter().setArrayDataSource(
                        "materiaCurso", rows, materiaCurso);
                })
        } else {
            this.filter().clearEditorDataSource("materiaCurso");
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
                this.setVisibleColumns())
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

    setVisibleColumns() {
        if (this.state.list != undefined) {
            this.list().setColumnsVisibility(this.state.list.visibleColumns)
        }
    }

    columns() {}

    rows() {}

    getState() {
        return {
            filter: {
                añoLectivo: this.getFilterValue("añoLectivo"),
                curso: this.getFilterValue("curso"),
                materiaCurso: this.getFilterValue("materiaCurso"),
            },
            list: {
                state: this.list().getState(),
                visibleColumns: this.getVisibleColumns()
            }
        }
    }

    setState() {
        return this.setFilter(this.state.filter)
    }

    setFilter(filter) {
        this.settingFilter = true;
        return Promise.resolve(this.setFilterValue("añoLectivo", filter.añoLectivo || Dates.ThisYear()))
            .then(() =>
                this.loadCursos(filter.curso))
            .then(() =>
                this.loadMateriasCursos(filter.materiaCurso))
            .then(() =>
                this.refresh())
            .then(() =>
                this.settingFilter = false)
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

    isNotasVisible() {

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
        return this.getFilterText("curso") + " / " + this.getFilterValue("añoLectivo")
    }

    materiaDescripcion() {
        return this.getFilterText("materiaCurso")
    }

    alumno() {
        return this.row("id")
    }

    alumnoDescripcion() {
        return this.row("apellido") + ", " + this.row("nombre")
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

    itemAñoLectivoOnValueChanged(e) {
        if (this.settingFilter != true) {
            this.loadCursos();
        }
    }

    itemCursoOnValueChanged(e) {
        if (this.settingFilter != true) {
            this.loadMateriasCursos();
        }
    }

    itemMateriaCursoOnValueChanged(e) {
        if (this.settingFilter != true) {
            this.refresh()
        }
    }

    listOnCellPrepared(e) {
        if (Dates.NoEsFuturo(e.column.temporalidad) && e.column.isNota == true) {
            if (Dates.NoEsFuturo(e.column.subTemporalidad)) {
                e.cellElement.css(this.class().COLOR_NOTA_EDITABLE)
            } else {
                e.cellElement.css(this.class().COLOR_NOTA_NO_EDITABLE)
            }
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
                width: Dates.EsFuturo(periodoRow.temporalidad) ? 200 : undefined,
                visible: true,
                columns: this.periodoColumns(periodoRow),
                allowReordering: false,
                allowResizing: true
            })
        }
        return columns;
    }

    periodoColumns(periodoRow) {
        const columns = [
            this.grupoExamenes(periodoRow),
            this.grupoPromedioValoracion({
                periodoRow: periodoRow,
                name: "preliminar",
                caption: "Informe Preliminar",
                headerTemplate: "Informe Preliminar" + "<small><br>" + (Utils.IsDefined(periodoRow.preliminar) ? Dates.Format(periodoRow.preliminar) : "<i>(fecha no definida)"),
                visible: Dates.NoEsFuturo(periodoRow.temporalidad)
            }),
            this.grupoPromedioValoracion({
                periodoRow: periodoRow,
                name: "promedio",
                caption: periodoRow.temporalidad == Dates.PASADO ? "Final" : "Proyectado",
                visible: Dates.NoEsFuturo(periodoRow.temporalidad)
            }),
            this.grupoStatus({
                periodoRow: periodoRow,
                visible: Dates.NoEsFuturo(periodoRow.temporalidad)
            })
        ]
        return columns
    }

    grupoExamenes(periodoRow) {
        return {
            name: "examenes_" + periodoRow.id,
            caption: "Examenes",
            temporalidad: periodoRow.temporalidad,
            alignment: "center",
            columns: this.examenesColumns(periodoRow),
            width: this.examenesRows.length == 0 ? 200 : 500
        }
    }

    examenesColumns(periodoRow) {
        let columns = [];
        for (const examenRow of this.examenesRows) {
            if (examenRow.periodo == periodoRow.id) {
                columns.push({
                    dataField: "examen_" + examenRow.id,
                    caption: examenRow.nombre,
                    alignment: "center",
                    isNota: true,
                    allowEditing: false,
                    temporalidad: periodoRow.temporalidad,
                    subTemporalidad: examenRow.temporalidad,
                    editCellTemplate: NotasBase.NotaEditor,
                    width: 100,
                    allowReordering: false,
                    allowResizing: true,
                })
            }
        }
        if (periodoRow.examenesCantidad <= 1 && periodoRow.temporalidad == Dates.FUTURO) {
            columns = columns.concat(this.emptyColumn(periodoRow, 200));
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
                    dataField: p.name + "_promedio_" + p.periodoRow.id,
                    temporalidad: p.periodoRow.temporalidad,
                    alignment: "center",
                    width: p.width || NotasColumns.PROMEDIO_WIDTH,
                    allowEditing: false,
                    allowSorting: true,
                },
                {
                    caption: "Valoración",
                    dataField: p.name + "_valoracion_" + p.periodoRow.id,
                    temporalidad: p.periodoRow.temporalidad,
                    alignment: "center",
                    width: p.width || NotasColumns.VALORACION_WIDTH,
                    allowEditing: false,
                    allowSorting: true,
                }
            ]
        }
    }

    grupoStatus(p) {
        return {
            name: "status_" + p.periodoRow.id,
            caption: "Status",
            temporalidad: p.periodoRow.temporalidad,
            alignment: "center",
            visible: Utils.IsDefined(p.visible) ? p.visible : true,
            columns: [{
                dataField: "status_descripcion_" + p.periodoRow.id,
                caption: "",
                temporalidad: p.periodoRow.temporalidad,
                allowSorting: true,
                width: 150,
            }]
        }
    }

    anualColumn() {
        if (this.notasData.hasPeriodos()) {
            return [{
                name: "anual",
                esAnual: true,
                caption: "Anual",
                alignment: "center",
                columns: this.anualColumns(),
            }]
        }
    }

    anualColumns() {
        return [{
            caption: "Proyectado",
            esAnual: true,
            alignment: "center",
            columns: [{
                    dataField: "anual_promedio",
                    caption: "Promedio",
                    esAnual: true,
                    alignment: "center",
                    width: 80,
                },
                {
                    dataField: "anual_valoracion",
                    caption: "Valoración",
                    esAnual: true,
                    alignment: "center",
                    width: 90,
                }
            ]
        }]

    }

    emptyColumn(periodoRow, width) {
        return {
            temporalidad: Utils.IsDefined(periodoRow) ? periodoRow.temporalidad : undefined,
            width: width
        }
    }

}

class NotasRowsBase {

    constructor(notas) {
        this.notas = notas;
        this.notasData = this.notas.notasData();
        this.alumnosRows = this.notasData.alumnosRows;
        this.includeNotas = true;
    }

    rows() {
        const rows = [];
        for (const alumnoRow of this.alumnosRows) {
            const id = alumnoRow.id;
            rows.push(Object.assign({},
                this.alumnoRow(alumnoRow), this.notasData.alumnoTotalesRow(alumnoRow.id, this.includeNotas)
            ))
        }
        return rows;
    }

    alumnoRow(alumnoRow) {
        return { id: alumnoRow.id, apellido: alumnoRow.apellido, nombre: alumnoRow.nombre };
    }

}