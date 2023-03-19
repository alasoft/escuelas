class Periodos extends AñoLectivoFilterView {

    labelText() {
        return "Períodos";
    }

    listColumns() {
        return [
            Column.Text({ dataField: "nombre", caption: "Nombre", width: 300 }),
            Column.Date({
                dataField: "desde",
                width: 300,
            }),
            Column.Date({
                dataField: "hasta"
            }),
        ]
    }

    formViewClass() {
        return PeriodosFormView;
    }

    deleteMessage() {
        const data = this.focusedRowData();
        return Messages.Build([{
            title: "Borra el Período ?",
            detail: data.nombre
        }, {
            title: "que va",
            detail: "Del " + Dates.Format(data.desde) + " Al " + Dates.Format(data.hasta),
            quotes: false
        }])
    }

    excelFileName() {
        return "Períodos " + this.getFilterText("añolectivo");
    }


    static Descripcion(data) {
        if (Utils.IsDefined(data)) {
            return Strings.Concatenate([
                data.nombre + ": del ",
                Dates.Format(data.desde) + " al ",
                Dates.Format(data.hasta)
            ])
        } else {
            return ""
        }
    }

}

class PeriodosFormView extends FormView {

    popupConfiguration() {
        return {
            title: "Período",
            width: 550,
            height: 400
        }
    }

    formItems() {
        return [
            Item.ReadOnly({ dataField: "añolectivo", width: 100 }),
            Item.Text({ dataField: "nombre", required: true }),
            Item.Date({ dataField: "desde", required: true, }),
            Item.Date({ dataField: "hasta", required: true, })
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
        if (err.code == Exceptions.FECHA_DESDE_DEBE_SER_MENOR_FECHA_HASTA) {
            this.handleFechaDesdeDebeSerMenor(err)
        } else if (err.code == Exceptions.PERIODO_INTERSECTA_OTRO_PERIODO) {
            this.handlePeriodoIntersecta(err)
        } else if (err.code == Exceptions.PERIODO_CONTIENE_OTRO_PERIODO) {
            this.handlePeriodoContiene(err)
        } else {
            super.handleError(err);
        }
    }

    duplicatedMessage() {
        return Messages.Build({ message: "Ya existe Período con el nombre:", detail: this.getEditorValue("nombre") })
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
        }, { message: "contiene al Período" + err.detail.nombre }])
    }

    handlePeriodoIntersecta(err) {
        App.ShowMessage([{
            message: "El " + this.getEditorValue("nombre"),
            quotes: false,
            detail: "Del " + this.getDate("desde") + " al " + this.getDate("hasta")
        }, {
            message: "intersecta al " + err.detail.nombre,
            quotes: false,
            detail: "Del " + Dates.Format(err.detail.desde) + " al " + Dates.Format(err.detail.hasta)
        }])
    }

}