class Escuelas extends ListView {

    static DefineDataSource() {
        return DsList({ path: "escuelas", cache: true });
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

    deleteMessageParameters() {
        return {
            prefix: "esta Escuela",
            dataField: "nombre"
        }
    }

}

class EscuelasFormView extends FormView {

    defineRest() {
        return new Rest({ path: "escuelas" });
    }

    popupExtraConfiguration() {
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