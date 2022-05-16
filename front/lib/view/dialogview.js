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
        return Templates.DialogView();
    }

    popupConfiguration() {
        return {
            visible: true
        }
    }

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

}