class DialogView extends View {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            mode: "popup",
            popup: this.popupExtraConfiguration(),
            components: {
                toolbar: {
                    items: this.toolbarItems()
                }
            }
        })
    }

    defineTemplate() {
        return Templates.DialogView();
    }

    popupExtraConfiguration() {}

    toolbar() {
        return this.components().toolbar;
    }

    toolbarItems() {
        return [this.itemOkey(), this.itemCancel()]
    }

    itemOkey() {
        return Tbi.Okey({
            onClick: e => this.okey()
        })
    }

    itemCancel() {
        return Tbi.Cancel({
            onClick: e => this.cancel()
        })
    }

    okey() {
        this.close(true)
    }

    cancel() {
        this.close(false);
    }

}