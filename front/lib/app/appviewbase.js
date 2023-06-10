class AppViewBase extends View {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            element: "body",
            components: {
                toolbar: {
                    componentClass: Toolbar,
                    templateClass: App.TOOLBAR_NAME,
                    items: this.toolbarItems()
                },
                itemsResizer: {
                    componentClass: Resizer,
                    templateClass: App.ITEMS_RESIZER_NAME,
                },
                items: {
                    componentClass: TreeItems,
                    templateClass: App.ITEMS_NAME,
                    dataSource: this.itemsDataSource(),
                    onFocusedRowChanged: e => this.itemsOnFocusedRowChanged(e)
                }

            }
        })
    }

    items() {
        return this.components().items;
    }

    defineTemplate() {
        return new AppViewTemplate();
    }

    toolbarItems() {
        return [this.toggleItemsButton(), this.userButton(), this.sistemaButton()]
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
                icon: "user",
                text: "Docente: " + App.UserNombreApellido()
            }
        }
    }

    sistemaButton() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "bell",
                text: App.ShortName()
            }
        }
    }

    itemsDataSource() { }

    itemsOnFocusedRowChanged(e) {
        if (e.row.data.onClick) {
            e.row.data.onClick();
        } else {
            App.BlankViewElement();
        }
    }

    selectFirstItem() {
        this.items().focusFirstRow();
    }

}