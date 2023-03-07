class Materias extends ListView {

    static DefineDataSource() {
        return Ds({ path: "materias", cache: false });
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
        return this.composeDeleteMessage({ title: "esta Materia", description: this.focusedRowValue("nombre") })
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

    defineRest() {
        return new Rest({ path: "materias" })
    }

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

    deleteMessage() {
        return this.composeDeleteMessage({ title: "esta Materia", description: this.focusedRowValue("nombre") })
    }


}