class NotasBase extends CursoMateriaViewBase {

    static COLOR_NOTA_EDITABLE = {
        "background-color": "rgb(200, 245, 220)"
    }

    static COLOR_NOTA_NO_EDITABLE = {
        //                "background-color": "rgb(208, 249, 231  )"
        //        "background-color": "rgb(200, 245, 220)"
        //                "background-color": "rgb(238, 247, 222 )"
        "background-color": "rgb(225, 228, 228)"
    }

    static COLOR_PASADO = {
        "background-color": "rgb(239, 241, 243)"
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

    static NotaEditor(cellElement, cellInfo) {
        return $("<div>").dxNumberBox({
            value: cellInfo.value,
            min: 1,
            max: 10,
            showSpinButtons: true,
            onValueChanged: e => cellInfo.setValue(e.value)
        })
    }

    notasData() {
        return this.data()
    }

    defineData() {
        return new NotasData()
    }

    refresh() {
        return this.notasData().refresh({ curso: this.curso(), materiaCurso: this.materiaCurso() })
            .then(() =>
                this.refreshListToolbar())
            .then(() =>
                this.refreshColumns())
            .then(() =>
                this.setVisibleColumns())
            .then(() =>
                this.refreshRows())
            .then(() =>
                this.list().focus())
            .catch(err =>
                this.handleError(err))
    }

    checkPeriodos() {
        if (!this.notasData().hayPeriodos()) {
            return App.ShowMessage([{
                message: "No hay períodos definidos para el año lectivo",
                detail: "<i>Por favor, primero cargue los períodos ..",
                quotes: false,
            }])
        }
    }

    checkValoraciones() {
        if (!this.notasData().hayValoraciones()) {
            return App.ShowMessage([{
                message: "No hay valoraciones pedagógicas",
                detail: "<i>Es necesario tener las valoraciones, para poder cargar las notas.<br>" + Html.Tab(2) + "Por favor, primero agregue las valoraciones ..",
                quotes: false,
            }])
        }
    }

    setVisibleColumns() {
        if (this.state.list != undefined) {
            this.list().setColumnsVisibility(this.state.list.visibleColumns)
        }
    }

    defineColumns() {
        return new NotasColumns(this).columns()
    }

    defineRows() {
        return new NotasRows(this).rows()
    }

    getVisibleColumns() {

        function addState(notas, nombre) {
            state[nombre] = notas.isColumnVisible(nombre)
        }

        const state = {};

        if (this.notasData().periodosRows != undefined) {
            for (const periodoRow of this.notasData().periodosRows) {
                addState(this, "periodo_" + periodoRow.id)
                addState(this, "examenes_" + periodoRow.id)
                addState(this, "preliminar_" + periodoRow.id)
                addState(this, "promedio_" + periodoRow.id)
                addState(this, "status_descripcion_" + periodoRow.id)
            }
        }

        addState(this, "anual")

        return state;

    }

    itemAlumnos() {
        if (this.filterValueDefined("curso"))
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
        if (this.filterValueDefined("curso"))
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

    itemExcel() {
        if (this.filterValueDefined("curso"))
            return super.itemExcel()
    }

    alumnos() {
        new AlumnosCurso({
            mode: "popup",
            isDetail: true,
            añoLectivo: this.añoLectivo(),
            curso: this.curso(),
            añoLectivoReadOnly: true,
            cursoReadOnly: true
        }).render()
            .then(closeData =>
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

    listOnCellPrepared(e) {
        if (Dates.NoEsFuturo(e.column.temporalidad) && e.column.isNota == true) {
            if (Dates.NoEsFuturo(e.column.subTemporalidad)) {
                e.cellElement.css(this.class().COLOR_NOTA_EDITABLE)
            } else {
                e.cellElement.css(this.class().COLOR_NOTA_NO_EDITABLE)
            }
        } else if (e.column.temporalidad == Dates.PASADO) {
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

class NotasColumns {

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
        if (this.notas.filterValueDefined("curso"))
            return [{
                dataField: "id",
                visible: false
            },
            { dataField: "apellido", width: 150, allowReordering: false, allowEditing: false },
            { dataField: "nombre", width: 150, allowReordering: false, allowEditing: false }]
        else
            return []
    }

    periodosColumns() {
        const columns = []
        for (const periodoRow of this.periodosRows) {
            if (Dates.NoEsFuturo(periodoRow.temporalidad)) {
                columns.push({
                    name: "periodo_" + periodoRow.id,
                    headerCellTemplate: periodoRow.nombre + Periodos.TemporalidadDescripcion(periodoRow.temporalidad) + "<small><br>" + Dates.DesdeHasta(periodoRow.desde, periodoRow.hasta),
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

class NotasRows {

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