class YesNoView extends MessageView {

    toolbarItems() {
        return [
            this.itemYes(),
            this.itemNo()
        ]
    }

    itemYes() {
        return Tbi.Yes({
            onClick: e => this.yes()
        })
    }

    itemNo() {
        return Tbi.No({
            onClick: e => this.no()
        })
    }

    yes() {
        this.closeData = { okey: true }
        this.close();
    }

    no() {
        this.close();
    }

}