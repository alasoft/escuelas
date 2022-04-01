class AppToolbar extends Toolbar {

    defaultConfiguration() {
        return {
            element: App.ToolbarElement(),
            elementAttr: {
                class: "padding-left-5"
            },
            items: [
                this.toggleItemsButton(),
                this.userButton(),
                this.sistemaButton()
            ]
        }
    }

    toggleItemsButton() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "menu",
                onClick: e => App.ToggleItems()
            }
        }
    }

    userButton() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "rename",
                text: "Docente: " + App.UserNombreApellido()
            }
        }
    }

    sistemaButton() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "group",
                text: App.ApplicationShortName()
            }
        }

    }

}