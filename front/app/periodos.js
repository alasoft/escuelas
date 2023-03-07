class Periodos extends AñoLectivoFilterView {

    path() {
        return "periodos";
    }

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
        return this.composeDeleteMessage({
            title: "este Período",
            description: data.nombre + ", " + Dates.Format(data.desde) + " al " + Dates.Format(data.hasta)
        })
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

    defineRest() {
        return new Rest({ path: "periodos" });
    }

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

}