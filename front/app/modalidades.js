class Modalidades extends ListView {

    static DefineDataSource() {
        return Ds({ path: "modalidades", cache: false });
    }

    labelText() {
        return "Modalidades"
    }

    listColumns() {
        return [Column.Id(),
            "nombre"
        ]
    }

    formViewClass() {
        return ModalidadesForm;
    }

    deleteMessage() {
        return this.composeDeleteMessage({ title: "esta Modalidad", description: this.focusedRowValue("nombre") })
    }

    deleteErrorMessage(err) {
        return this.composeDeleteErrorMessasge({
            name: "la Modalidad",
            description: this.focusedRowValue("nombre"),
            err: err,
            vinculo: "vinculada"
        })
    }


}

class ModalidadesForm extends FormView {

    defineRest() {
        return new Rest({ path: "modalidades" });
    }

    popupConfiguration() {
        return {
            title: "Modalidad",
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