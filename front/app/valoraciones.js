class Valoraciones extends AñoLectivoView {

    extraConfiguration() {
        return {
            components: {
                toolbar: {
                    visible: false
                },
                list: {
                    headerFilter: {
                        visible: false
                    },
                    filterPanel: {
                        visible: false,
                    },
                    showBorders: true
                }
            }
        }
    }

    refreshListToolbar() {
        this.list().setToolbarItems(this.listToolbarItems());
    }

    listToolbarItems() {
        return [this.itemInsert(), this.itemExcelExport(), "searchPanel"];
    }

    labelText() {
        return "Valoraciones Pedagógicas";
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "nombre", width: 300 }),
            Column.Text({ dataField: "sigla", width: 100 }),
            Column.Text({
                dataField: "desde",
                width: 100
            }),
            Column.Text({
                dataField: "hasta",
                width: 100
            }),
            Column.Space()
        ]
    }

    formViewClass() {
        return ValoracionesFormView;
    }

    deleteMessage() {
        const data = this.focusedRowData();
        return Messages.Build([{
            message: "Borra la Valoración ?",
            detail: data.nombre
        }, {
            message: "para el rango",
            detail: data.desde + " / " + data.hasta,
            quotes: false
        }])
    }

    excelFileName() {
        return "Valoraciones Pedagógicas " + this.getFilterText("añolectivo");
    }

    listOnContentReady(e) {
        this.focusFirstRow();
        this.refreshContextMenuItems()
    }

    static Descripcion(data) {
        if (Utils.IsDefined(data)) {
            return Strings.Concatenate([
                data.nombre + ": ",
                Dates.Format(data.desde) + " al ",
                Dates.Format(data.hasta)
            ])
        } else {
            return ""
        }
    }

}

class ValoracionesFormView extends FormView {

    popupConfiguration() {
        return {
            title: "Valoración Pedagógica",
            width: 550,
            height: 400
        }
    }

    formItems() {
        return [
            Item.Group({
                colCount: 1,
                items: [
                    Item.ReadOnly({ dataField: "añolectivo", width: 100 }),
                    Item.Text({ dataField: "nombre", required: true }),
                    Item.Text({ dataField: "sigla", required: true, width: 100, case: "upper" }),
                ]
            }),
            Item.Group({
                colCount: 3,
                items: [Item.Number({
                        dataField: "desde",
                        required: true,
                        spin: true,
                        min: 1,
                        max: 10,
                        width: 70,
                        value: undefined
                    }),
                    Item.Number({
                        dataField: "hasta",
                        required: true,
                        spin: true,
                        min: 1,
                        max: 10,
                        width: 70,
                        value: undefined
                    })
                ]
            })
        ]
    }

    validateDesdeHasta(e, message) {
        let desde = this.form().getEditorValue("desde");
        let hasta = this.form().getEditorValue("hasta");
        return Dates.Compare(desde, hasta) <= 1
    }

    firstEditor() {
        return "nombre";
    }

    handleError(err) {
        if (err.code == Exceptions.SIGLA_DUPLICATED) {
            this.handleSiglaDuplicatedMessage(err)
        }
        if (err.code == Exceptions.NOTA_DESDE_DEBE_SER_MENOR_IGUAL_NOTA_HASTA) {
            this.handleNotaDesdeDebeSerMenorHasta(err)
        } else if (err.code == Exceptions.RANGO_NOTAS_INTERSECTA_OTRO_RANGO) {
            this.handleNotasIntersecta(err)
        } else if (err.code == Exceptions.RANGO_NOTAS_CONTIENE_OTRO_RANGO) {
            this.handleNotasContiene(err)
        } else {
            super.handleError(err);
        }
    }

    duplicatedMessage() {
        return Messages.Build({ message: "Ya existe una Valoración con el nombre:", detail: this.getEditorValue("nombre") })
    }

    handleSiglaDuplicatedMessage(err) {
        return Messages.Build({ message: "Ya existe una Valoración con la sigla:", detail: this.getEditorValue("sigla") })
    }

    handleNotaDesdeDebeSerMenorHasta(err) {
        App.ShowMessage([{
                message: "La nota desde",
                detail: this.getValue("desde")
            },
            {
                message: "debe ser menor a la nota hasta",
                detail: this.getValue("hasta")
            }
        ])
    }

    handleNotasIntersecta(err) {
        App.ShowMessage([{
            message: "La valoración " + this.getSingleQuotes("sigla"),
            quotes: false,
            detail: this.getValue("desde") + " - " + this.getValue("hasta")
        }, {
            message: "intersecta a la valoración " + Strings.SingleQuotes(err.detail.sigla),
            quotes: false,
            detail: err.detail.desde + " - " + err.detail.hasta
        }])
    }

    handleNotasContiene(err) {
        App.ShowMessage([{
            message: "La valoración " + this.getSingleQuotes("nombre"),
            quotes: false,
            detail: "Del " + this.getValue("desde") + " - " + this.getValue("hasta")
        }, {
            message: "contiene a la Valoración " + Strings.SingleQuotes(err.detail.sigla),
            quotes: false,
            detail: err.detail.desde + " - " + err.detail.hasta
        }])
    }

}