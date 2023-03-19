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
        return Messages.Build({ message: "Borra la Modalidad ?", detail: this.focusedRowValue("nombre") })
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
        return Messages.Build({ message: "Ya existe una Modalidad de nombre:", detail: this.getEditorText("nombre") })
    }


}