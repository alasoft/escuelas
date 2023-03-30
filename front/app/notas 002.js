class Notas extends CursosBaseView {

    extraConfiguration() {
        return {
            fullScreen: true,
            components: {
                label: {
                    text: "Notas por Curso y Materia"
                },
                filter: {
                    items: this.filterItems(),
                    labelLocation: "top",
                    width: 750
                },
                alumnosResizer: {
                    componentClass: Resizer,
                    handles: "right"
                },
                alumnos: {
                    componentClass: Grid,
                    keyExpr: "id",
                    dataSource: [],
                    wordWrapEnabled: true,
                    showBorders: true,
                    groupPanel: {
                        visible: false
                    },
                    toolbar: {
                        items: [this.itemAlumnosView(), "searchPanel"]
                    },
                    onContentReady: e => this.alumnosOnContentReady(e),
                    onFocusedRowChanged: e => this.alumnosOnFocusedRowChanged(e),
                    onDisposing: e => this.alumnosOnDisposing(e)
                },
                tps: {
                    componentClass: Grid,
                    keyExpr: "id",
                    dataSource: [],
                    showBorders: true,
                    columns: this.tpsColumns(),
                    groupPanel: {
                        visible: true
                    },
                    editing: {
                        mode: "cell",
                        allowUpdating: true,
                        startEditAction: "click",
                        selectTextOnEditStart: true
                    },
                    onContentReady: e => this.tpsOnContentReady(e),
                    onRowValidating: e => this.tpsOnRowValidating(e),
                },
                tpsContextMenu: {
                    componentClass: ContextMenu,
                    target: this.findElementByClass("tps"),
                }
            }
        }
    }

    defineTemplate() {
        return new NotasTemplate()
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 6,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso({ colSpan: 4 }),
                    this.itemMateriaCurso({
                        extraButton: {
                            name: "materiacurso",
                            options: {
                                icon: "doc",
                                hint: "Consulta Materias dictadas en el Curso",
                                onClick: e => this.materiasCurso()
                            }
                        }

                    })
                ]
            })
        ]
    }

    alumnosResizer() {
        return this.components().alumnosResizer;
    }

    alumnos() {
        return this.components().alumnos;
    }

    tps() {
        return this.components().tps;
    }

    tpsContextMenu() {
        return this.components().tpsContextMenu;
    }

    tpsColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "nombre", caption: "Trabajo Práctico", editing: false, width: 350 }),
            Column.Text({ dataField: "nota", caption: "Nota", width: 130, dataType: "number", format: "##" }),
            Column.Text({ dataField: "periodonombre", caption: "Período", editing: false })
        ]
    }

    itemAlumnosView() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "group",
                text: "Alumnos",
                hint: "Consulta Alumnos",
                onClick: e => this.alumnosCurso()
            }
        }
    }

    alumnosCurso() {
        new AlumnosCurso({
                mode: "popup",
                curso: this.curso(),
                añoLectivoReadOnly: true,
                cursoReadOnly: true
            })
            .render().then(closeData =>
                this.afterAlumnosCurso(closeData))
    }

    afterAlumnosCurso(closeData) {
        if (closeData.dataHasChanged == true) {
            this.notasAlumnos().refresh(true)
                .then(() =>
                    this.alumnos().focusRowById(closeData.id))
        } else if (closeData.id != undefined) {
            this.alumnos().focusRowById(closeData.id)
        }
    }

    materiasCurso() {
        new MateriasCurso({
                mode: "popup",
                curso: this.curso(),
                añoLectivoReadOnly: true,
                cursoReadOnly: true,
                materiaCursoReadOnly: true,
                materiacurso: this.materiaCurso()
            }).render()
            .then(closeData =>
                this.afterMateriaCurso(closeData))
    }


    itemTpsView() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "edit",
                text: "Trabajos Prácticos",
                hint: "Consulta Trabajos Prácticos",
                onClick: e => this.tpsCurso()
            }
        }
    }

    tpsCurso() {
        new TpsCurso({
                mode: "popup",
                showTodosButton: false,
                curso: this.curso(),
                añoLectivoReadOnly: true,
                cursoReadOnly: true,
                materiaCursoReadOnly: true,
                materiacurso: this.materiaCurso()
            }).render()
            .then(closeData =>
                this.afterTpsCurso(closeData))
    }

    afterTpsCurso(closeData) {
        if (closeData.dataHasChanged == true) {
            this.notasTps().refresh(true)
                .then(() =>
                    this.tps().focusRowById(closeData.id))
        } else if (closeData.id != undefined) {
            this.tps().focusRowById(closeData.id)
        }
    }

    afterRender() {
        super.afterRender()
        return this.loadPeriodos()
            .then(() =>
                this.refreshFilterValue("añolectivo", Dates.ThisYear()));
    }

    loadPeriodos() {
        return new Rest({ path: "periodos" })
            .promise({
                verb: "list",
                data: {
                    añolectivo: this.añoLectivo()
                }
            })
            .then(rows =>
                this.periodosRows = rows)
    }

    setItemMateriaCursoDataSource() {
        return super.setItemMateriaCursoDataSource()
            .then(() =>
                this.refreshAll())
    }

    refreshAll() {
        this.notasAlumnos().refresh()
            .then(() =>
                this.notasTps().refresh())
    }

    notasAlumnos() {
        if (this._notasAlumnos == undefined) {
            this._notasAlumnos = new NotasAlumnos(this);
        }
        return this._notasAlumnos;
    }

    notasTps() {
        if (this._notasTps == undefined) {
            this._notasTps = new NotasTps(this);
        }
        return this._notasTps;
    }

    loadNotas() {
        if (this.materiaCurso() != undefined) {
            return new Rest({ path: "notas" })
                .promise({
                    verb: "list",
                    data: { materiacurso: this.materiaCurso() }
                })
                .then(rows =>
                    this.notasRows = rows)
        } else {
            return Promise.resolve(this.notasRows = [])
        }
    }

    refreshTpsLabel() {
        this.tps().setToolbarItems([this.itemApellidoNombre(), this.itemTpsView()])
    }

    itemApellidoNombre() {
        if (this.alumnos().hasRows()) {
            const apellidoNombre = this.alumnos().focusedRowValue("alumno");
            return {
                location: "before",
                text: (apellidoNombre ? apellidoNombre + " / Notas" : "Notas")
            }
        }
    }

    tpsAgrupaPorPeriodo() {
        this.tps().setColumnProperties("periodonombre", { groupIndex: 0 }).focus()
    }

    tpsDesagrupaPeriodo() {
        this.tps().setColumnProperties("periodonombre", { groupIndex: undefined }).focus()
    }

    alumno() {
        return this.alumnos().id()
    }

    saveNote(p) {
        new Rest({ path: "notas" })
            .promise({
                verb: "update",
                data: {
                    tp: p.tp,
                    alumno: this.alumno(),
                    nota: p.nota
                }
            }).then(data =>
                this.tps().focus()
            ).catch(err => {
                if (err.code == Exceptions.NOTA_OUT_OF_RANGE) {
                    App.ShowMessage({ message: "La nota debe estar entre 1 y 10" })
                }
            })
    }

    refreshTpsContextMenu() {
        this.tpsContextMenu().setItems([this.itemTpsAgrupaPeriodo(), this.itemTpsDesagrupaPeriodo()])
    }

    itemTpsAgrupaPeriodo() {
        if (!this.tps().hasGroupedColumns()) {
            return {
                text: "Agrupa por Período",
                onClick: e =>
                    this.tpsAgrupaPorPeriodo()
            }
        }
    }

    itemTpsDesagrupaPeriodo() {
        if (this.tps().hasGroupedColumns()) {
            return {
                text: "Desagrupa Período",
                onClick: e =>
                    this.tpsDesagrupaPeriodo()
            }
        }
    }

    getState() {
        return Utils.Merge(super.getState(), {
            alumnosResizer: { width: this.alumnosResizer().getWidth() },
            alumnos: this.alumnos().getState(),
            tps: this.tps().getState()
        })
    }

    setState(state) {
        super.setState(state);
        if (state.alumnosResizer != undefined) {
            this.alumnosResizer().setWidth(state.alumnosResizer.width)
        }
        this.alumnos().setState(state.alumnos);
        this.tps().setState(state.tps)
    }

    itemAñoLectivoOnValueChanged(e) {
        if (e.value != undefined) {
            this.setItemCursoDataSource();
        }
    }

    itemCursoOnValueChanged(e) {
        this.setItemMateriaCursoDataSource();
    }

    itemMateriaCursoOnValueChanged(e) {
        this.notasTps().refresh()
    }

    alumnosOnContentReady(e) {
        this.refreshTpsLabel()
    }

    alumnosOnFocusedRowChanged(e) {
        this.refreshTpsLabel();
    }

    alumnosOnDisposing(e) {
        this.saveState()
    }

    tpsOnContentReady(e) {
        this.refreshTpsContextMenu();
    }

    tpsOnRowValidating(e) {
        this.saveNote({ tp: e.oldData.id, nota: e.newData.nota });
    }

}

class NotasDetail {

    constructor(notas) {
        this.notas = notas;
    }

    periodosRows() {
        return this.notas.periodosRows;
    }

    notasRows() {
        return this.notas.notasRows;
    }

    curso() {
        return this.notas.curso();
    }

    materiaCurso() {
        return this.notas.materiaCurso()
    }

    alumnos() {
        return this.notas.alumnos()
    }

    tps() {
        return this.notas.tps()
    }


}

class NotasAlumnos extends NotasDetail {

    refresh(forceRefresh = false) {
        if (this.alumnos().getColumns() == undefined) {
            this.alumnos().setColumns(this.columns())
        }
        if (this.curso() != this.cursoAnterior || forceRefresh == true) {
            return this.refreshCurso()
        } else if (this.materiaCurso() != this.materiaCursoAnterior) {
            return this.refreshPromedios()
        }
    }

    refreshCurso() {
        return this.notas.loadNotas()
            .then(() =>
                this.loadAlumnos())
            .then(() =>
                this.cursoAnterior = this.curso())
            .then(() =>
                this.setPromedios())
            .then(() =>
                this.materiaCursoAnterior = this.materiaCurso())
            .then(() =>
                this.alumnos().setDataSource(DsArray({
                    rows: this.alumnosRows
                })))
            .then(() =>
                this.alumnos().focusFirstRow(true))
    }

    refreshPromedios() {
        return Promise.resolve(this.setPromedios())
            .then(() =>
                this.materiaCursoAnterior = this.materiaCurso())
            .then(() =>
                this.alumnos().setDataSource(DsArray({
                    rows: this.alumnosRows
                })))
    }

    columns() {
        const columns = [
            { dataField: "id", visible: false },
            { dataField: "apellido", visible: false },
            { dataField: "nombre", visible: false },
            { dataField: "alumno", width: 200 }
        ]
        for (const periodoRow of this.periodosRows()) {
            columns.push({
                dataField: periodoRow.id,
                caption: periodoRow.nombre
            })
        }
        columns.push({
            dataField: "anual"
        })
        return columns;
    }

    loadAlumnos() {
        if (Utils.IsDefined(this.curso())) {
            return new Rest({ path: "alumnos" })
                .promise({ verb: "list", data: { curso: this.curso() } })
                .then(rows =>
                    this.alumnosRows = rows)
                .then(() =>
                    this.setAlumnos())
        } else {
            this.alumnosRows = [];
        }
    }

    setAlumnos() {
        for (const alumnoRow of this.alumnosRows) {
            alumnoRow.alumno = alumnoRow.apellido + ", " + alumnoRow.nombre
        }
    }

    setPromedios() {
        for (const alumnoRow of this.alumnosRows) {
            this.setPromedio(alumnoRow);
        }
    }

    setPromedio(alumnoRow) {
        for (const periodoRow of this.periodosRows()) {
            alumnoRow[periodoRow.id] = this.promedio(alumnoRow.id, periodoRow.id)
        }
    }

    promedio(alumnoId, periodoId) {
        let nSuma = 0;
        let nCantidad = 0;
        for (const notasRow of this.notasRows()) {
            if (notasRow.alumno == alumnoId && periodoId == notasRow.periodoId) {
                ++nSuma;
                ++nCantidad;
            }
        }
        if (0 < nCantidad) {
            return Math.round(nSuma / nCantidad)
        }
    }

}

class NotasTps extends NotasDetail {

    refresh(forceRefresh = false) {
        if (this.materiaCurso() != this.materiaCursoAnterior || forceRefresh == true) {
            return this.loadTps()
                .then(() =>
                    this.tps().setDataSource(DsArray({ rows: this.tpsRows })))
                .then(() =>
                    this.materiaCursoAnterior = this.materiaCurso())
        }
    }

    loadTps() {
        if (Utils.IsDefined(this.materiaCurso())) {
            return new Rest({ path: "tps" })
                .promise({
                    verb: "list",
                    data: { materiacurso: this.materiaCurso() }
                })
                .then(rows =>
                    this.tpsRows = rows)
        } else {
            return Promise.resolve(this.tpsRows = []);
        }
    }

}


class NotasTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.label(),
                this.body()
            ]
        }
    }

    label() {
        return {
            name: "label",
            marginBottom: App.LABEL_BOTTOM_MARGIN
        }
    }

    body() {
        return {
            fillContainer: true,
            orientation: "vertical",
            padding: App.BOX_PADDING,
            backgroundColor: App.BOX_BACKGROUND_COLOR,
            items: [
                this.filter(),
                this.detail()
            ]
        }
    }

    filter() {
        return {
            name: "filter",
            orientation: "vertical",
            height: 80
        }
    }

    detail() {
        return {
            fillContainer: true,
            orientation: "horizontal",
            items: [
                this.alumnosResizer(),
                this.tps(),
                this.tpsContextMenu()
            ]
        }
    }

    alumnosResizer() {
        return {
            name: "alumnosResizer",
            orientation: "vertical",
            width: 500,
            marginRight: App.BOX_MARGIN,
            items: [
                this.alumnos()
            ]
        }
    }

    alumnos() {
        return {
            name: "alumnos",
            fillContainer: true,
            orientation: "vertical",
            height: 1
        }
    }

    tps() {
        return {
            fillContainer: true,
            width: "70%",
            orientation: "vertical",
            items: [{
                    name: "tps",
                    fillContainer: true,
                    orientation: "vertical",
                    height: 1
                }

            ]
        }
    }

    tpsContextMenu() {
        return {
            name: "tpsContextMenu"
        }
    }

}