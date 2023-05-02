class Materias extends SimpleListView {

    static DefineDataSource() {
        return App.RegisterDataSource(this, {
            path: "materias",
            cache: true
        });
    }

    labelText() {
        return "Materias Genéricas"
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
        return Messages.Build({ message: "Borra la Materia ?", detail: this.focusedRowValue("nombre") })
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
        return Messages.Build({ message: "Ya existe una Materia genérica de nombre", detail: this.getEditorText("nombre") })
    }


}