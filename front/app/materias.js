class Materias extends ListView {

    static DefineDataSource() {
        return App.RegisterDataSource(this, {
            path: "materias",
            cache: true
        });
    }

    labelText() {
        return "Materias"
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "nombre" }),
        ]
    }

    formViewClass() {
        return MateriasForm;
    }

    deleteMessage() {
        return Messages.Section({ title: "Borra la Materia ?", detail: this.focusedRowValue("nombre") })
    }

    deleteErrorMessage(err) {
        return this.composeDeleteErrorMessasge({
            name: "esta Materia",
            description: this.focusedRowValue("nombre"),
            err: err,
            vinculo: "vinculada"
        })
    }

}

class MateriasForm extends FormView {

    popupConfiguration() {
        return {
            title: "Materia",
            width: 600,
            height: 250
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Text({
                dataField: "nombre",
                required: true,
            }),
        ]
    }

    duplicatedMessage() {
        return Messages.Section({ title: "Ya existe una Materia de nombre:", detail: this.getEditorText("nombre") })
    }


}