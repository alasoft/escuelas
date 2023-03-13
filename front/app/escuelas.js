class Escuelas extends ListView {

    static DefineDataSource() {
        return App.RegisterDataSource(this, {
            path: "escuelas",
            cache: true
        })
    }

    labelText() {
        return "Escuelas"
    }

    listColumns() {
        return [Column.Id(),
            "nombre"
        ]
    }

    formViewClass() {
        return EscuelasFormView;
    }

    deleteMessage() {
        return Messages.Section({ title: "Borra la Escuela ?", detail: this.focusedRowValue("nombre") })
    }

    deleteErrorMessage(err) {
        return this.composeDeleteErrorMessasge({
            name: "la Escuela",
            description: this.focusedRowValue("nombre"),
            err: err,
            vinculo: "vinculada"
        })
    }

}

class EscuelasFormView extends FormView {

    popupConfiguration() {
        return {
            title: "Escuela",
            width: 500,
            height: 250
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Nombre(),
        ]
    }

}