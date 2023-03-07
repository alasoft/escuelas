class AppToolbarBase extends Toolbar {

    extraConfiguration() {
        return {
            items: this.items()
        }
    }

    items() {
        return [this.toggleAppItems()]
    }

    toggleAppItems() {
        return {
            widget: "dxButton",
            location: "before",
            option: {
                icon: "menu",
                onClick: e => App.ToggleItems()
            }
        }
    }

}