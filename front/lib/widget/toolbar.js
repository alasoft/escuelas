class Toolbar extends Widget {

    widgetName() {
        return "dxToolbar"
    }

    setItems(items) {
        this.setProperty("items", Arrays.NoNulls(items));
    }

}

class ToolbarItem {

    static Okey(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: "after",
            options: {
                text: "Okey",
                icon: "check",
            }
        }, p)
    }

    static Insert(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: "before",
            options: {
                icon: "plus",
                hint: "Agrega",
            }
        }, p)
    }

    static Cancel(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: "after",
            options: {
                text: "Cancela",
                icon: "close",
            }
        }, p)
    }

    static Yes(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: "after",
            options: {
                text: "Si",
            }
        }, p)
    }

    static No(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: "after",
            options: {
                text: "No",
            }
        }, p)
    }

    static WantToRegister(p) {
        return Utils.Merge({
            widget: "dxButton",
            location: p.location || "before",
            options: {
                text: "Me quiero registrar",
                icon: "user",
            }
        }, p)
    }

}