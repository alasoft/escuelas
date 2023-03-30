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
                    columns: this.alumnosColumns(),
                    dataSource: [],
                    showBorders: true,
                    groupPanel: {
                        visible: false
                    },
                    toolbar: {
                        items: [this.itemAlumnosCurso(), this.itemPlanilla(), "searchPanel"]
                    },
                    onContentReady: e => this.alumnosOnContentReady(e),
                    onFocusedRowChanged: e => this.alumnosOnFocusedRowChanged(e),
                    onDisposing: e => this.alumnosOnDisposing(e)
                },
                tps: {
                    componentClass: Grid,
                    keyExpr: "id",
                    dataSource: [],
                    columns: this.tpsColumns(),
                    showBorders: true,
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

    alumnosResizer() {
        return this.components().alumnosResizer;
    }

    alumnos() {
        return this.components().alumnos;
    }

    alumno(dataField) {
        return this.alumnos().focusedRowValue(dataField)
    }

    tps() {
        return this.components().tps;
    }

    tpsContextMenu() {
        return this.components().tpsContextMenu;
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
                                icon: "copy",
                                hint: "Consulta Materias dictadas en el Curso",
                                onClick: e => this.materiasCurso()
                            }
                        }

                    })
                ]
            })
        ]
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
                this.afterMateriasCurso(closeData))
    }

    afterMateriasCurso(closeData) {
        if (closeData.dataHasChanged == true) {
            this.setItemMateriaCursoDataSource(closeData.id)
        } else if (closeData.id != undefined) {
            this.refreshFilterValue("materiacurso", closeData.id)
        }
    }

    alumnosColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "apellido" }),
            Column.Text({ dataField: "nombre" }),
        ]
    }

    itemAlumnosCurso() {
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

    itemPlanilla() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "print",
                text: "Planilla",
                hint: "Planilla de Calificaciones por Período",
                onClick: e => this.planillaCalificaciones()
            }
        }
    }

    tpsColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "nombre", caption: "Trabajo Práctico", editing: false, width: 350 }),
            Column.Text({ dataField: "nota", caption: "Nota", width: 100, dataType: "number", format: "##" }),
            Column.Calculated({ caption: "Inicia - Entrega", formula: row => Dates.Format(row.desde) + "  - " + Dates.Format(row.hasta), width: 250 }),
            Column.Text({ dataField: "periodonombre", caption: "Período", editing: false }),
        ]
    }

    itemTpsCurso() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "background",
                text: "Trabajos Prácticos",
                hint: "Consulta Trabajos Prácticos",
                onClick: e => this.tpsCurso()
            }
        }
    }

    setItemCursoDataSource(id) {
        super.setItemCursoDataSource(id)
            .then(() =>
                this.loadAlumnos())
    }

    setItemMateriaCursoDataSource() {
        super.setItemMateriaCursoDataSource()
            .then(() =>
                this.loadNotas())
            .then(() =>
                this.loadTps())
    }

    loadAlumnos() {
        if (Utils.IsDefined(this.curso())) {
            return new Rest({ path: "alumnos" })
                .promise({
                    verb: "list",
                    data: { curso: this.curso() }
                })
                .then(rows =>
                    this.alumnos().setArrayDataSource(rows))
        } else {
            this.alumnos().clearDataSource();
        }
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

    loadTps() {
        if (this.materiaCurso() != undefined) {
            new Rest({ path: "tps" })
                .promise({
                    verb: "list",
                    data: {
                        materiacurso: this.materiaCurso(),
                    }
                })
                .then(rows =>
                    this.tps().setArrayDataSource(rows))
        } else {
            this.tps().setDataSource(null);
        }
    }


    refreshTpsToolbar() {
        this.tps()
            .setToolbarItems([
                this.itemApellidoNombre(),
                this.itemTpsCurso()
            ])
    }

    itemApellidoNombre() {
        if (this.alumnos().hasRows()) {
            const apellidoNombre = this.alumno("apellido") + ", " + this.alumno("nombre");
            return {
                location: "before",
                text: (apellidoNombre ? apellidoNombre + " / Notas" : "Notas")
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
            this.loadAlumnos()
                .then(() =>
                    this.alumnos().focusRowById(closeData.id))
        } else if (closeData.id != undefined) {
            this.alumnos().focusRowById(closeData.id)
        }
    }

    planillaCalificaciones() {

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

    saveNote(p) {
        new Rest({ path: "notas" })
            .promise({
                verb: "update",
                data: {
                    tp: p.tp,
                    alumno: this.alumno("id"),
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

    afterRender() {
        super.afterRender()
            .then(() =>
                this.refreshFilterValue("añolectivo", this.state.añoLectivo || Dates.ThisYear()));
    }

    getState() {
        return Utils.Merge(super.getState(), {
            añoLectivo: this.añoLectivo(),
            curso: this.curso(),
            materiaCurso: this.materiaCurso(),
            alumnosResizer: { width: this.alumnosResizer().getWidth() },
            alumnos: this.alumnos().getState(),
            tps: this.tps().getState()
        })
    }

    setState() {
        super.setState();
        if (this.state.alumnosResizer != undefined) {
            this.alumnosResizer().setWidth(this.state.alumnosResizer.width)
        }
        this.alumnos().setState(this.state.alumnos);
        this.tps().setState(this.state.tps)
    }

    itemAñoLectivoOnValueChanged(e) {
        if (e.value != undefined) {
            this.setItemCursoDataSource(this.firstCursoId());
        }
    }

    firstCursoId() {
        this._firstCursoId = this.state.curso;
        if (this.state.curso != undefined) {
            this.state.curso = undefined;
        }
        return this._firstCursoId;
    }

    itemCursoOnValueChanged(e) {
        this.setItemMateriaCursoDataSource();
    }

    itemMateriaCursoOnValueChanged(e) {
        this.loadTps()
    }

    alumnosOnContentReady(e) {
        this.refreshTpsToolbar()
    }

    alumnosOnFocusedRowChanged(e) {
        this.refreshTpsToolbar()
    }

    alumnosOnDisposing(e) {
        this.saveState()
    }

    tpsOnContentReady(e) {
        //        this.refreshTpsContextMenu();
    }

    tpsOnRowValidating(e) {
        this.saveNote({ tp: e.oldData.id, nota: e.newData.nota });
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
            width: 450,
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