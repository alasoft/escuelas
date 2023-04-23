class MessageView extends DialogView {

    static HEIGHT_DEFAULT = 150;
    static WIDTH_DEFAULT = 250;

    popupConfiguration() {
        return {
            title: this.parameters().title || this.popupTitleDefault(),
            showCloseButton: this.parameters().closeButton == true,
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
        return this.parameters().height || this.calculatedHeight()
    }

    calculatedHeight() {
        return Math.min(600, this.message().length + 130);
    }

    popupWidth() {
        return this.parameters().width || this.calculatedWidth()
    }

    calculatedWidth() {
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

    saveState() {
        return Promise.resolve();
    }

}

class MessageViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.message(),
                this.toolbar()
            ]
        }
    }

    message() {
        return {
            name: "message",
            fillContainer: true
        }
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }
}