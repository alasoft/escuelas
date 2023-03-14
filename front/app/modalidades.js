class Modalidades extends ListView {

    static DefineDataSource() {
        return App.RegisterDataSource(this, {
            path: "modalidades",
            cache: true
        });
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
        return Messages.Section({ title: "Borra la Modalidad ?", detail: this.focusedRowValue("nombre") })
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

    duplicatedMessage() {
        return Messages.Section({ title: "Ya existe una Modalidad de nombre:", detail: this.getEditorText("nombre") })
    }


}