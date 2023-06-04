class NotasAlumno extends View {

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Notas por Alumno",
                fullScreen: false,
                width: 1100,
                height: 650
            },
            components: {
                form: {
                    items: this.formItems(),
                    width: 1400
                },
                list: {
                    keyExpr: "id",
                    dataSource: this.rows(),
                    columns: this.columns(),
                    showBorders: true,
                    focusedRowEnabled: false,
                    hoverStateEnabled: true,
                    editing: {
                        mode: "cell",
                        allowUpdating: true,
                        startEditAction: "click",
                        selectTextOnEditStart: true
                    },
                    summary: {
                        groupItems: [{
                            column: "nota",
                            summaryType: "avg",
                            alignment: "left",
                            showInColumn: "periodoNombre",
                            customizeText: data =>
                                this.customizeTextPromedio(data)
                        }],
                        totalItems: [{
                            summaryType: "custom",
                            name: "total",
                            alignment: "left",
                            column: "nota",
                            customizeText: data =>
                                this.customizeTextPromedio(data)
                        }],
                        calculateCustomSummary: options =>
                            this.calculateCustomSummary(options)
                    },
                    onContentReady: e => this.listOnContentReady(e),
                    onCellPrepared: e => this.listOnCellPrepared(e),
                    onEditingStart: e => this.listOnEditingStart(e),
                    onRowUpdating: e => this.listOnRowUpdating(e),
                },
                toolbar: {
                    items: this.toolbarItems()
                }
            }
        }
    }

    customizeTextPromedio(data) {
        if (data.value != undefined) {
            const promedio = Math.round(data.value);
            return promedio + " / " + this.notasData().valoracion(Math.round(data.value))
        } else {
            return "";
        }
    }

    calculateCustomSummary(options) {
        if (options.name == "total") {
            if (options.summaryProcess == "calculate") {
                options.totalValue = this.alumnoPromedioAnual.promedio
            }
        }
    }

    defineTemplate() {
        return new NotasAlumnoTemplate()
    }

    form() {
        return this.components().form;
    }

    list() {
        return this.components().list;
    }

    formItems() {
        return [
            Item.Group({
                colCount: 6,
                items: [
                    Item.ReadOnly({ dataField: "curso", width: 400, colSpan: 2 }),
                    Item.ReadOnly({ dataField: "materia", width: 300 }),
                ]
            }),
            Item.Group({
                colCount: 6,
                items: [
                    Item.ReadOnly({ dataField: "alumno", width: 300, colSpan: 2, template: () => this.alumnoTemplate() }),
                    Item.ReadOnly({ dataField: "status", width: 200, template: () => this.estadoTemplate(), visible: false })
                ]
            })
        ]
    }

    alumnoTemplate() {
        this._alumnoTemplate = $("<div>").css({
            "font-style": "italic",
            "font-size": "15px",
            "font-weight": 400
        });
        return this._alumnoTemplate;
    }

    estadoTemplate() {
        this._alumnoEstado = $("<div>").addClass("font-label");
        return this._alumnoEstado;
    }

    refreshAlumnoTemplate() {
        this._alumnoTemplate.text(this.listView().alumnoDescripcion())
    }

    columns() {
        return [
            Column.Id(),
            Column.Calculated({ caption: "Tipo", formula: row => ExamenesTipos.GetNombre(row.tipo), width: 150 }),
            Column.Text({ dataField: "nombre", caption: "Nombre", editing: false, width: 270 }),
            Column.Text({ dataField: "nota", caption: "Nota", dataType: "number", format: "##", width: 100, editor: NotasBase.NotaEditor }),
            Column.Text({ dataField: "periodoNombre", caption: "Período", editing: false, width: 250 }),
            Column.Calculated({ caption: "Inicia", formula: row => Dates.Format(row.desde), width: 150 }),
            Column.Calculated({ caption: "Cierre", formula: row => Dates.Format(row.hasta) }),
        ]
    }

    toolbarItems() {
        return [this.itemSalida(), this.itemAnterior(), this.itemSiguiente()]
    }

    itemSalida() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "close",
                text: "Salida",
                onClick: e => this.salida()
            }
        }
    }

    itemAnterior() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "arrowleft",
                text: "Anterior",
                onClick: e => this.anterior()
            }
        }
    }

    itemSiguiente() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "arrowright",
                text: "Siguiente",
                onClick: e => this.siguiente()
            }
        }
    }

    salida() {
        this.checkEdit().then(() =>
            this.close())
    }

    anterior() {
        this.checkEdit().then(() => {
            if (this.listView().anterior()) {
                this.refresh()
            }
        })
    }

    siguiente() {
        this.checkEdit().then(() => {
            if (this.listView().siguiente()) {
                this.refresh()
            }
        })
    }

    checkEdit() {
        if (this.list().isEditing()) {
            return this.list().saveEdit()
        } else {
            return Promise.resolve()
        }
    }

    listView() {
        return this.parameters().listView;
    }

    notasData() {
        return this.listView().notasData()
    }

    alumno() {
        return this.listView().alumno();
    }

    rows(forceRefresh = false) {
        if (this._rows == undefined || forceRefresh) {
            this._rows = this.defineRows()
        }
        return this._rows;
    }

    defineRows() {
        this.refreshPromedioAnual();
        return new NotasAlumnosRows(this).rows();
    }

    refreshPromedioAnual() {
        this.alumnoPromedioAnual = this.notasData().alumnoPromedioAnual(this.alumno())
    }

    refresh() {
        this.refreshForm();
        this.refreshPromedioAnual();
        this.list().setArrayDataSource(this.rows(true))
        this.list().focus()
    }

    refreshForm() {
        this.refreshFormData();
        this.refreshAlumnoTemplate()
    }

    refreshFormData() {
        this.form().setData({
            curso: this.listView().cursoDescripcion(),
            materia: this.listView().materiaDescripcion(),
        })
    }

    afterRender() {
        super.afterRender()
            .then(() => {
                this.refreshForm();
            })
    }

    saveNota(p) {
        Promise.resolve(this.notasData().saveNota(p.examen, p.alumno, p.nota))
            .then(() =>
                this.alumnoPromedioAnual = this.notasData().alumnoPromedioAnual(p.alumno))
            .then(() =>
                new Rest({ path: "notas" }).promise({
                    verb: "update",
                    data: {
                        examen: p.examen,
                        alumno: p.alumno,
                        nota: p.nota
                    }
                }))
            .then(() =>
                this.dataHasChanged = true)
            .catch(err =>
                this.handleError(err, p))
    }

    handleError(err, p) {
        if (err.code == Exceptions.NOTA_OUT_OF_RANGE) {
            return App.ShowMessage({ message: "La nota debe estar entre 1 y 10" })
                .then(() =>
                    this.list().updateRow(this.row("id"), { nota: p.notaAnterior || null }))
                .then(() =>
                    this.list().focus())
        } else {
            return super.handleError(err)
        }
    }

    row(dataField) {
        return this.list().focusedRowValue(dataField)
    }

    closeDataDefault() {
        return { dataHasChanged: this.dataHasChanged }
    }

    listOnContentReady(e) {
        this.list().focus()
    }

    listOnRowUpdating(e) {
        this.saveNota({
            examen: e.oldData.id,
            alumno: this.alumno(),
            nota: e.newData.nota,
            notaAnterior: e.oldData.nota
        });
    }

    getState() {
        return Utils.Merge(super.getState(), { list: this.list().getState() })
    }

    setState() {
        super.setState();
        if (this.list().isReady()) {
            this.list()
                .setState(this.state.list || null)
                .focusFirstRow()
        }
    }

    listOnEditingStart(e) {
        if (e.data.temporalidad == Dates.FUTURO) {
            e.cancel = true;
            App.ShowMessage([{
                message: "No es posible ingresar una nota para el Examen",
                detail: e.data.nombre
            }, {
                message: "ya que su fecha de inicio es futura",
                detail: Dates.Format(e.data.desde)
            }])
        }
    }

    listOnCellPrepared(e) {
        if (this.esFuturo(e)) {
            this.estiloFuturo(e)
        } else if (e.rowType == "data" && e.column.caption == "Nota") {
            this.estiloNota(e)
        }
    }

    popupOnHiding(e) {
        this.saveState().then(() =>
            super.popupOnHiding(e)
        );
    }

    esFuturo(e) {
        if (e.rowType == "group") {
            const row = this.notasData().getPeriodoRowByName(e.data.key);
            if (row != undefined && row.temporalidad == Dates.FUTURO) {
                return true;
            }
        } else if (e.rowType == "data") {
            if (e.data.temporalidad == Dates.FUTURO) {
                return true;
            }
        }
        return false;
    }

    estiloFuturo(e) {
        e.cellElement.css({
            "background-color": "rgb(225, 228, 228)"
        })
    }

    estiloNota(e) {
        e.cellElement.css({
            "background-color": "rgb(181, 238, 220)"
        })
    }

}

class NotasAlumnosRows {

    constructor(notasAlumnos) {
        this.notasAlumnos = notasAlumnos;
        this.notasData = this.notasAlumnos.notasData();
        this.examenesRows = this.notasData.examenesRows;
    }

    rows() {
        const rows = []
        for (const row of this.examenesRows) {
            rows.push({
                id: row.id,
                tipo: row.tipo,
                nombre: row.nombre,
                desde: row.desde,
                hasta: row.hasta,
                periodo: row.periodo,
                periodoNombre: row.periodonombre,
                nota: this.notasData.getNota(row.id, this.notasAlumnos.alumno()),
                temporalidad: this.notasData.getExamenRow(row.id).temporalidad
            })
        }
        return rows;
    }

}

class NotasAlumnoTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.form(),
                this.list(),
                this.toolbar(),
            ]
        }
    }


    form() {
        return {
            name: "form",
            orientation: "vertical",
            marginTop: 15,
            height: 100
        }
    }

    list() {
        return {
            name: "list",
            fillContainer: true,
            orientation: "vertical",
            height: 1
        }
    }

    toolbar() {
        return {
            name: "toolbar",
            marginTop: 10,
        }
    }

}