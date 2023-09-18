class CursoMateriaViewBase extends FilterViewBase {

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

    getState() {
        return {
            filter: {
                añoLectivo: this.getFilterValue("añoLectivo"),
                curso: this.getFilterValue("curso"),
                materiaCurso: this.getFilterValue("materiaCurso"),
            },
            list: {
                visibleColumns: this.getVisibleColumns()
            }
        }
    }

    getVisibleColumns() { }

    setState() {
        if (this.filter().isReady()) {
            return this.setFilterValues(this.state.filter)
        }
    }

    setFilterValues(values) {
        Promise.resolve(this.settingFilterValues = true)
            .then(() =>
                this.setFilterValue("añoLectivo", values.añoLectivo || Dates.ThisYear()))
            .then(() =>
                this.loadCursos(values.curso))
            .then(() =>
                this.loadMateriasCursos(values.materiaCurso))
            .then(() =>
                this.refresh())
            .then(() =>
                this.settingFilterValues = false)
    }

    loadCursos(curso) {
        if (this.filter().isReady()) {
            if (this.añoLectivo() != undefined) {
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
    }

    loadMateriasCursos(materiaCurso) {
        if (this.filter().isReady()) {
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
    }

    data() {
        if (this._data == undefined) {
            this._data = this.defineData()
        }
        return this._data;
    }

    refreshColumns() {
        this.list().setColumns(this.columns(true));
    }

    refreshRows() {
        this.list().setArrayDataSource(this.rows(true))
    }

    columns(forceRefresh = false) {
        if (this._columns == undefined || forceRefresh == true) {
            this._columns = this.defineColumns()
        }
        return this._columns;
    }

    rows(forceRefresh = false) {
        if (this._rows == undefined || forceRefresh == true) {
            this._rows = this.defineRows()
        }
        return this._rows;
    }

    defineColumns() {
        return []
    }

    defineRows() {
        return [];
    }

    itemAñoLectivoOnValueChanged(e) {
        if (this.settingFilterValues != true) {
            this.loadCursos();
        }
    }

    itemCursoOnValueChanged(e) {
        if (this.settingFilterValues != true) {
            this.loadMateriasCursos();
        }
    }

    itemMateriaCursoOnValueChanged(e) {
        if (this.settingFilterValues != true) {
            this.refresh()
        }
    }

    listOnCellPrepared(e) { }

}