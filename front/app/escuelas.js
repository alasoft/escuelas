class Escuelas extends ListView {

    static DefineDataSource() {
        return Ds({
            path: "escuelas",
        });
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
        return this.composeDeleteMessage({ title: "esta Escuela", description: this.focusedRowValue("nombre") })
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

    defineRest() {
        return new Rest({ path: "escuelas" });
    }

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