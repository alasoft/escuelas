class DialogView extends View {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            mode: "popup",
            popup: this.popupConfiguration(),
            components: {
                toolbar: {
                    items: this.toolbarItems()
                }
            }
        })
    }

    defineTemplate() {
        return new DialogViewTemplate();
    }

    popupConfiguration() {}

    toolbar() {
        return this.components().toolbar;
    }

    toolbarItems() {
        return [this.itemOkey(), this.itemCancel()]
    }

    itemOkey() {
        return ToolbarItem.Okey({ onClick: e => this.okey() })
    }

    itemCancel() {
        return ToolbarItem.Cancel({ onClick: e => this.cancel() })
    }

    okey() {
        this.close(this.closeDataOkey())
    }

    cancel() {
        this.close(this.closeDataCancel());
    }

    closeDataOkey() {
        return { okey: true };
    }

    closeDataCancel() {
        return { okey: false };
    }

    originalTitle() {
        return Utils.Evaluate(this.configuration().popup.title);
    }

}

class DialogViewTemplate extends Template {

    defaultParameters() {
        return Utils.Merge(super.defaultParameters(), {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.toolbar()
            ]
        })
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }

}