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
                    onRowValidating: e => this.onRowValidating(e),
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
            Column.Calculated({ caption: "Tipo", formula: row => EvaluacionesTipos.GetNombre(row.tipo), width: 150 }),
            Column.Text({ dataField: "nombre", caption: "Nombre", editing: false, width: 270 }),
            Column.Text({ dataField: "nota", caption: "Nota", dataType: "number", format: "##", width: 100 }),
            Column.Text({ dataField: "periodoNombre", caption: "Período", editing: false, width: 250 }),
            Column.Calculated({ caption: "Inicia", formula: row => Dates.Format(row.desde), width: 150 }),
            Column.Calculated({ caption: "Entrega", formula: row => Dates.Format(row.hasta) }),
        ]
    }

    toolbarItems() {
        return [this.itemAnterior(), this.itemSiguiente()]
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

    anterior() {
        if (this.listView().anterior()) {
            this.refresh()
        }
    }

    siguiente() {
        if (this.listView().siguiente()) {
            this.refresh()
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
        return this.notasData().alumnoRows(this.alumno())
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
            evaluacion: p.evaluacion,
            alumno: p.alumno,
            nota: p.nota
        }
        new Rest({ path: "notas" })
            .promise({
                verb: "update",
                data: notasRow
            })
            .then(() =>
                this.dataHasChanged = true)
            .catch(err =>
                this.handleError(err, p))
    }

    handleError(err, p) {
        if (err.code == Exceptions.NOTA_OUT_OF_RANGE) {
            App.ShowMessage({ message: "La nota debe estar entre 1 y 10" })
                .then(() =>
                    this.list().updateRow(this.row("id"), { nota: p.notaAnterior || null }))
                .then(() =>
                    this.list().focus())
        } else {
            super.handleError(err)
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

    onRowValidating(e) {
        this.saveNota({
            evaluacion: e.oldData.id,
            alumno: this.alumno(),
            nota: e.newData.nota,
            notaAnterior: e.oldData.nota
        });
    }

    listOnCellPrepared(e) {
        if (e.rowType == "data") {
            if (e.data.futuro == true) {
                e.cellElement.css({
                    "color": "black",
                    "background-color": "rgb(246,240,239)"
                })
            }
        }
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