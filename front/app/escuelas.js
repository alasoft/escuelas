class Escuelas extends ListView {

    static DefineDataSource() {
        return DsList({ path: "escuelas" });
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