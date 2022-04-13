class MessageView extends DialogView {

    static WIDTH_DEFAULT = 250;
    static HEIGHT_DEFAULT = 200;

    popupConfiguration() {
        return {
            title: this.title(),
            showCloseButton: false,
            width: this.popupWidth(),
            height: this.popupHeight(),
        }
    }

    title() {
        return "Atención"
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
        return MessageView.WIDTH_DEFAULT +
            this.message().length +
            100 +
            Utils.Occurences(this.message(), "<br>") * 20;
    }

    popupHeight() {
        return MessageView.HEIGHT_DEFAULT +
            this.message().length / 2 +
            Utils.Occurences(this.message(), "<br>") * 15;
    }

    popupTemplate(e) {
        super.popupTemplate(e);
        this.findElement("text").append(this.message())
    }

    focus() {
        this.toolbar().focus()
    }

    message() {
        return this.parameters().message;
    }

}