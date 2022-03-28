class MessageView extends DialogView {

    static WIDTH_DEFAULT = 250;
    static HEIGHT_DEFAULT = 200;

    popupExtraConfiguration() {
        return {
            title: "Atención",
            showCloseButton: false,
            width: this.popupWidth(),
            height: this.popupHeight(),
        }
    }

    defineTemplate() {
        return Templates.MessageView()
    }

    toolbarItems() {
        return [
            this.itemOkey()
        ]
    }

    itemOkey() {
        return Tbi.Okey({
            noIcon: true,
            onClick: e => this.okey()
        })
    }

    popupWidth() {
        return MessageView.WIDTH_DEFAULT + this.parameters().message.length + 50;
    }

    popupHeight() {
        return MessageView.HEIGHT_DEFAULT + this.parameters().message.length / 2;
    }

    popupTemplate(e) {
        super.popupTemplate(e);
        this.findElement("text").append(this.parameters().message)
    }

    focus() {
        this.toolbar().focus()
    }

}