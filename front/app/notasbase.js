class NotasBase extends FilterViewBase {

    static TemporalidadDescripcion(t) {
        if (t == Dates.PASADO) {
            return " / Cerrado"
        } else if (t == Dates.PRESENTE) {
            return " / Vigente"
        } else {
            return " / Futuro"
        }
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
                    }
                }
            }
        })
    }

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
                }).then(rows => {
                    this.filter().setArrayDataSource(
                        "materiacurso", rows, this.settingState == true ? this.state.filter.materiaCurso : undefined);
                }).then(() =>
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

    columns() { throw { message: "NotasBase.js, columns() no implementado" } }

    rows() { throw {} }

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
        this.setFilterValue("añolectivo", (this.state.filter != undefined && this.state.filter.añoLectivo != undefined) ?
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

}