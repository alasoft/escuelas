class Valoraciones extends AñoLectivoFilterView {

    labelText() {
        return "Valoraciones Pedagógicas";
    }

    listColumns() {
        return [
            Column.Text({ dataField: "nombre", width: 300 }),
            Column.Text({ dataField: "sigla", width: 300 }),
            Column.Text({
                dataField: "desde",
                width: 300,
            }),
            Column.Text({
                dataField: "hasta"
            }),
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
            message: "Del",
            detail: Dates.Format(data.desde, true) + " al " + Dates.Format(data.hasta, true),
            quotes: false
        }])
    }

    excelFileName() {
        return "Valoraciónes " + this.getFilterText("añolectivo");
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
            Item.ReadOnly({ dataField: "añolectivo", width: 100 }),
            Item.Text({ dataField: "nombre", required: true }),
            Item.Text({ dataField: "sigla", required: true, width: 100, case: "upper" }),
            Item.Number({
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

    handleNotaDesdeDebeSerMenorHasta(err) {
        App.ShowMessage([{
                message: "La nota desde",
                detail: this.getDate("desde")
            },
            {
                message: "debe ser menor a la nota hasta",
                detail: this.getDate("hasta")
            }
        ])
    }

    handleNotasIntersecta(err) {
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

    handleNotasContiene(err) {
        App.ShowMessage([{
            message: "El " + this.getEditorValue("nombre"),
            quotes: false,
            detail: "Del " + this.getDate("desde") + " al " + this.getDate("hasta")
        }, {
            message: "contiene la Valoración",
            detail: err.detail.nombre
        }])
    }

}