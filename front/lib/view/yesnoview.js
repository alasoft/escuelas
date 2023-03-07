class YesNoView extends MessageView {

    toolbarItems() {
        return [
            this.itemYes(),
            this.itemNo()
        ]
    }

    itemYes() {
        return ToolbarItem.Yes({
            onClick: e => this.yes()
        })
    }

    itemNo() {
        return ToolbarItem.No({
            onClick: e => this.no()
        })
    }

    yes() {
        this.okey();
    }

    no() {
        this.cancel();
    }

    cancel() {
        return this.close(this.closeDataCancel())
    }

    closeDataCancel() {
        return { okey: false };
    }

}