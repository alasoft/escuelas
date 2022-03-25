class Toolbar extends Widget {

    widgetName() {
        return "dxToolbar"
    }

}

class Tbi {

    static Okey(p = {}) {
        return {
            widget: "dxButton",
            location: p.location || "after",
            options: {
                text: "Okey",
                icon: p.noIcon != true ? (p.icon || "check") : undefined,
                height: p.height,
                onClick: p.onClick
            }
        }
    }

    static Cancel(p = {}) {
        return {
            widget: "dxButton",
            location: p.location || "after",
            options: {
                text: "Cancela",
                icon: "close",
                onClick: p.onClick
            }
        }
    }


    static WantToRegister(p = {}) {

        return {
            widget: "dxButton",
            location: p.location || "before",
            options: {
                text: "Me quiero registrar",
                icon: "user",
                onClick: p.onClick
            }
        }
    }

    static Yes(p = {}) {
        return {
            widget: "dxButton",
            location: p.location || "after",
            options: {
                text: "Si",
                height: p.height,
                onClick: p.onClick
            }
        }
    }

    static No(p = {}) {
        return {
            widget: "dxButton",
            location: p.location || "after",
            options: {
                text: "No",
                height: p.height,
                onClick: p.onClick
            }
        }
    }

}