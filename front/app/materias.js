class Materias extends ListView {

    static DefineDataSource() {
        return DsList({ path: "materias" });
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

}

class MateriasForm extends FormView {

    defineRest() {
        return new Rest({ path: "materias" })
    }

    popupExtraConfiguration() {
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

}