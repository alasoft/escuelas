class MessageView extends DialogView {

    static HEIGHT_DEFAULT = 200;
    static WIDTH_DEFAULT = 250;

    popupConfiguration() {
        return {
            title: this.parameters().title || this.popupTitleDefault(),
            showCloseButton: false,
            onShowing: e => this.popupOnShowing(e)
        }
    }

    defineTemplate() {
        return new MessageViewTemplate();
    }

    popupTitleDefault() {
        return App.MESSAGE_TITLE;
    }

    toolbarItems() {
        return [
            this.itemOkey()
        ]
    }

    afterRender() {
        this.template().findElementByClass("message").append(this.message())
    }

    popupOnShowing(e) {
        this.popup().setProperties({ height: this.popupHeight(), width: this.popupWidth() })
    }

    popupHeight() {
        return Math.min(600, MessageView.HEIGHT_DEFAULT +
            this.message().length / 2 + 40);
    }

    popupWidth() {
        return Math.min(600, MessageView.WIDTH_DEFAULT +
            this.message().length + 100);
    }

    message() {
        if (this._message == undefined) {
            this._message = this.defineMessage();
        }
        return this._message;
    }

    defineMessage() {
        return this.parameters().message;
    }

}