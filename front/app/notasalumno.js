class NotasAlumno extends View {

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: this.title(),
                fullScreen: false,
                width: 1100
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
                    onContentReady: e => this.listOnContentReady(e),
                    onCellPrepared: e => this.listOnCellPrepared(e),
                    onEditingStart: e => this.listOnEditingStart(e),
                    onRowUpdating: e => this.onRowUpdating(e),
                },
                toolbar: {
                    items: this.toolbarItems()
                }
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

    title() {
        return this.listView().alumnoDescripcion()
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
                    Item.ReadOnly({ dataField: "alumno", width: 300, colSpan: 2, cssInput: "read-only", visible: false }),
                    Item.ReadOnly({ dataField: "status", width: 200, cssInput: "read-only", visible: false })
                ]

            })
        ]
    }

    columns() {
        return [
            Column.Id(),
            Column.Calculated({ caption: "Tipo", formula: row => ExamenesTipos.GetNombre(row.tipo), width: 150 }),
            Column.Text({ dataField: "nombre", caption: "Nombre", editing: false, width: 270 }),
            Column.Text({ dataField: "nota", caption: "Nota", dataType: "number", format: "##", width: 100, editor: this.notaEditor }),
            Column.Text({ dataField: "periodoNombre", caption: "Período", editing: false, width: 250 }),
            Column.Calculated({ caption: "Inicia", formula: row => Dates.Format(row.desde), width: 150 }),
            Column.Calculated({ caption: "Entrega", formula: row => Dates.Format(row.hasta) }),
        ]
    }

    notaEditor(cellElement, cellInfo) {
        return $("<div>").dxNumberBox({
            value: cellInfo.value,
            min: 1,
            max: 10,
            showSpinButtons: true,
            onValueChanged: e => cellInfo.setValue(e.value)
        })
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
    rows() {
        return new NotasAlumnosRows(this).rows();
    }

    refresh() {
        this.popup().setTitle(this.title());
        this.refreshForm();
        this.list().setArrayDataSource(this.rows())
        this.list().focus()
    }

    refreshForm() {
        this.form().setData({
            curso: this.listView().cursoDescripcion(),
            materia: this.listView().materiaDescripcion(),
            alumno: this.listView().alumnoDescripcion(),
            //            status: this.listView().alumnoStatus()
        })
    }

    afterRender() {
        super.afterRender()
            .then(() => this.refreshForm())
    }

    saveNota(p) {
        const notasRow = {
            examen: p.examen,
            alumno: p.alumno,
            nota: p.nota
        }
        return new Rest({ path: "notas" })
            .promise({
                verb: "update",
                data: notasRow
            })
            .then(() =>
                this.notasData().saveNota(p.examen, p.alumno, p.nota))
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

    onRowUpdating(e) {
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
        this.list()
            .setState(this.state.list || null)
            .focusFirstRow()
    }

    listOnEditingStart(e) {
        if (e.data.temporalidad == Dates.FUTURO) {
            e.cancel = true;
            App.ShowMessage([{
                message: "No es posible ingresar una nota en el Período",
                detail: e.data.periodoNombre
            }, {
                message: "ya que no está vigente."
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
            "background-color": "rgb(236, 243, 243)"
        })
    }

    estiloNota(e) {
        e.cellElement.css({
            "background-color": "rgb(229, 250, 250)"
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
                temporalidad: this.notasData.getPeriodoRow(row.periodo).temporalidad
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
                this.toolbar()
            ]
        }
    }

    form() {
        return {
            name: "form",
            orientation: "vertical",
            marginTop: 15,
            height: 80
        }
    }

    list() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [{
                name: "list",
                fillContainer: true,
                orientation: "vertical",
                height: 1
            }]

        }
    }

    toolbar() {
        return {
            name: "toolbar",
            marginTop: 10,
        }
    }


}