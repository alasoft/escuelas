class Modalidades extends ListView {

    static DefineDataSource() {
        return DsList({ path: "modalidades", cache: true });
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

    deleteMessageParameters() {
        return {
            prefix: "esta Modalidad",
            dataField: "nombre"
        }
    }

}

class ModalidadesForm extends FormView {

    defineRest() {
        return new Rest({ path: "modalidades" });
    }

    popupExtraConfiguration() {
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