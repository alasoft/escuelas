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
                    onFocusedRowChanged: e => this.alumnosOnFocusedRowChanged(e)
                },
                tps: {
                    componentClass: Grid,
                    keyExpr: "id",
                    dataSource: [],
                    showBorders: true,
                    columns: this.tpsColumns(),
                    groupPanel: {
                        visible: false
                    }
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
                    this.itemMateriaCurso()
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
            this.notasAlumnos().refresh()
        } else if (closeData.id != undefined) {
            this.alumnos().focusRowById(closeData.id)
        }
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
                this.notasAlumnos().refresh())
    }

    notasAlumnos() {
        if (this._notasAlumnos == undefined) {
            this._notasAlumnos = new NotasAlumnos(this);
        }
        return this._notasAlumnos;
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
        const apellidoNombre = this.alumnos().focusedRowValue("alumno");
        this.tps().setToolbarItems([{
            location: "before",
            text: (apellidoNombre ? apellidoNombre + " / Notas" : "Notas")
        }, this.itemTpsView()])
    }

    itemAñoLectivoOnValueChanged(e) {
        if (e.value != undefined) {
            this.setItemCursoDataSource();
        }
    }

    itemCursoOnValueChanged(e) {
        this.setItemMateriaCursoDataSource();
    }

    alumnosOnFocusedRowChanged(e) {
        this.refreshTpsLabel();
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

    refresh() {
        if (this.alumnos().getColumns() == undefined) {
            this.alumnos().setColumns(this.columns())
        }
        if (this.curso() != this.cursoAnterior) {
            this.refreshCurso()
        } else if (this.materiaCurso() != this.materiaCursoAnterior) {
            this.refreshPromedios()
        }
    }

    refreshCurso() {
        return this.notas.loadNotas()
            .then(() =>
                this.loadRows())
            .then(() =>
                this.cursoAnterior = this.curso())
            .then(() =>
                this.setPromedios())
            .then(() =>
                this.materiaCursoAnterior = this.materiaCurso())
            .then(() =>
                this.alumnos().setDataSource(DsArray({
                    rows: this.rows
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
                    rows: this.rows
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

    loadRows() {
        return new Rest({ path: "alumnos" })
            .promise({ verb: "list", data: { curso: this.curso() } })
            .then(rows =>
                this.rows = rows)
            .then(() =>
                this.setAlumnos())
    }

    setAlumnos() {
        for (const row of this.rows) {
            row.alumno = row.apellido + ", " + row.nombre
        }
    }

    setPromedios() {
        for (const row of this.rows) {
            this.setPromedio(row);
        }
    }

    setPromedio(row) {
        for (const periodoRow of this.periodosRows()) {
            row[periodoRow.id] = this.promedio(row.id, periodoRow.id)
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

class NotasTps {



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
                this.tps()
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
            name: "tps",
            fillContainer: true,
            orientation: "vertical",
        }
    }

}