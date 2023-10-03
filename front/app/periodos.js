class Periodos extends AñoLectivoView {

    extraConfiguration() {
        return {
            popup: {
                title: "Períodos",
                width: 1100
            },
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
        return "Períodos";
    }

    listColumns() {
        return [
            Column.Text({ dataField: "nombre", caption: "Nombre", width: 300 }),
            Column.Date({
                dataField: "desde",
            }),
            Column.Date({
                dataField: "hasta",
            }),
            Column.Date({
                dataField: "preliminar",
                caption: "Informe Preliminar",
            }),
            Column.Empty()
        ]
    }

    formViewClass() {
        return PeriodosFormView;
    }

    deleteMessage() {
        const data = this.focusedRowData();
        return Messages.Build([{
            message: "Borra el Período ?",
            detail: data.nombre
        }, {
            message: "Del",
            detail: Dates.Format(data.desde, true) + " al " + Dates.Format(data.hasta, true),
            quotes: false
        }])
    }

    excelFileName() {
        return "Períodos " + this.getFilterText("añolectivo");
    }

    listOnContentReady(e) {
        this.focusFirstRow();
        this.refreshListToolbar();
        this.refreshContextMenuItems();
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


    static TemporalidadDescripcion(t) {
        if (t == Dates.PASADO) {
            return " / Pasado"
        } else if (t == Dates.PRESENTE) {
            return " / Vigente"
        } else {
            return " / Futuro"
        }
    }

}

class PeriodosFormView extends FormView {

    popupConfiguration() {
        return {
            title: "Período",
            width: 600,
            height: 450
        }
    }

    formItems() {
        return [
            Item.Group({
                colCount: 1,
                items: [
                    Item.ReadOnly({ dataField: "añolectivo", width: 100 }),
                    Item.Text({ dataField: "nombre", required: true }),
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    Item.Date({ dataField: "desde", required: true }),
                    Item.Date({ dataField: "hasta", required: true }),
                    Item.Date({ dataField: "preliminar", label: "Informe Preliminar", clearButton: true })
                ]
            }),
            Item.Group({
                colCount: 2,
                items: []
            })

        ]
    }

    firstEditor() {
        return "nombre";
    }

    handleError(err) {
        if (err.code == Exceptions.FECHA_DESDE_DEBE_SER_MENOR_FECHA_HASTA) {
            this.handleFechaDesdeDebeSerMenor(err)
        } else if (err.code == Exceptions.PERIODO_INTERSECTA_OTRO_PERIODO) {
            this.handlePeriodoIntersecta(err)
        } else if (err.code == Exceptions.PERIODO_CONTIENE_OTRO_PERIODO) {
            this.handlePeriodoContiene(err)
        } else if (err.code == Exceptions.PRELIMINAR_DEBE_ESTAR_ENTRE_DESDE_HASTA) {
            this.handlePreliminarDesdeHasta(err)
        } else if (err.code == Exceptions.FECHA_DESDE_DEBE_ESTAR_EN_AÑO_LECTIVO) {
            this.handleFechaDesdeDebeEstarEnAño(err)
        } else if (err.code == Exceptions.FECHA_HASTA_DEBE_ESTAR_EN_AÑO_LECTIVO) {
            this.handleFechaHastaDebeEstarEnAño(err)
        } else {
            super.handleError(err);
        }
    }

    duplicatedMessage() {
        return Messages.Build({ message: "Ya existe un Período con el nombre:", detail: this.getEditorValue("nombre") })
    }

    handleFechaDesdeDebeSerMenor(err) {
        App.ShowMessage([{
            message: "La fecha desde",
            detail: this.getDate("desde")
        },
        {
            message: "debe ser menor a la fecha hasta",
            detail: this.getDate("hasta")
        }
        ])
    }

    handlePeriodoContiene(err) {
        App.ShowMessage([{
            message: "El " + this.getEditorValue("nombre"),
            quotes: false,
            detail: "Del " + this.getDate("desde") + " al " + this.getDate("hasta")
        }, {
            message: "contiene al Período",
            detail: err.detail.nombre
        }])
    }

    handlePeriodoIntersecta(err) {
        App.ShowMessage([{
            message: "El " + this.getEditorValue("nombre"),
            quotes: false,
            detail: "Del " + this.getDate("desde") + " al " + this.getDate("hasta")
        }, {
            message: "colisiona con el " + err.detail.nombre,
            quotes: false,
            detail: "Del " + Dates.Format(err.detail.desde) + " al " + Dates.Format(err.detail.hasta)
        }])
    }

    handlePreliminarDesdeHasta(err) {
        App.ShowMessage([{
            message: "La fecha del Informe Preliminar",
            detail: this.getDate("preliminar"),
            quotes: false,
        }, {
            message: "debe estar entre la fecha Desde y Hasta",
            quotes: false,
            detail: this.getDate("desde") + "  -  " + this.getDate("hasta")
        }])
    }

    handleFechaDesdeDebeEstarEnAño(err) {
        App.ShowMessage([{
            message: "La fecha desde",
            detail: this.getDate("desde")
        }, {
            message: "debe ser estar dentro del Año Lectivo",
            detail: this.getValue("añolectivo")
        }])
    }

    handleFechaHastaDebeEstarEnAño(err) {
        App.ShowMessage([{
            message: "La fecha hasta",
            detail: this.getDate("hasta")
        }, {
            message: "debe ser estar dentro del Año Lectivo",
            detail: this.getValue("añolectivo")
        }])
    }

}