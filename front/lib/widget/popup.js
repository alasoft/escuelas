class Popup extends Widget {

    widgetName() {
        return "dxPopup";
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            resizeEnabled: true,
            showCloseButton: true,
            backgroundColor: App.POPUP_BACKGROUND_COLOR,
            shading: true,
            removeOnClose: true
        })
    }

    defineElement() {
        var element;
        var i = 1;
        while ($("#" + App.POPUP_PREFFIX_ID + "-" + i).length) {
            i++
        }
        element = $("<div id='" + App.POPUP_PREFFIX_ID + "-" + i + "'>").dxPopup(this.parameters());
        $("body").append(element);
        return element;
    }

    render() {
        this.show();
    }

    show() {
        this.instance().show()
    }

    hide() {
        this.instance().hide();
    }

    close() {
        this.hide();
        this.element().remove();
    }

    setTitle(title) {
        this.setProperty("title", title);
    }

}