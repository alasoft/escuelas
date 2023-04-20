class AlumnoNotas extends View {

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: this.title(),
                fullScreen: false,
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
        return new AlumnoNotasTemplate()
    }

    form() {
        return this.components().form;
    }

    list() {
        return this.components().list;
    }

    title() {
        return "Notas del Alumno:  " + this.listView().alumnoDescripcion()
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
                    Item.ReadOnly({ dataField: "alumno", width: 300, colSpan: 2 }),
                    Item.ReadOnly({ dataField: "status", width: 300, cssInput: "read-only" })
                ]

            })

        ]
    }

    columns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "nombre", caption: "Trabajo Práctico", editing: false, width: 350 }),
            Column.Text({ dataField: "nota", caption: "Nota", width: 130, dataType: "number", format: "##" }),
            Column.Text({ dataField: "periodoNombre", caption: "Período", editing: false, width: 350 }),
            Column.Calculated({ caption: "Inicia", formula: row => Dates.Format(row.desde) }),
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

    data() {
        return this.listView().data()
    }

    alumno() {
        return this.listView().alumno();
    }
    rows() {
        return this.data().alumnoRows(this.alumno())
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
            status: this.listView().alumnoStatus()
        })
    }

    afterRender() {
        super.afterRender()
            .then(() => this.refreshForm())
    }

    saveNota(p) {
        const notasRow = {
            tp: p.tp,
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
            tp: e.oldData.id,
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

class AlumnoNotasTemplate extends Template {

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