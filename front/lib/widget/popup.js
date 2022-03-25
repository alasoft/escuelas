class Popup extends Widget {

    constructor(...parameters) {
        super(...parameters);
    }

    widgetName() {
        return "dxPopup";
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            resizeEnabled: true,
            showCloseButton: true,
            backgroundColor: App.POPUP_BACKGROUND_COLOR_DEFAULT,
            shading: true,
        })
    }

    defineElement() {
        var element;
        var i = 1;
        while ($("#" + App.POPUP_PREFFIX_ID + "-" + i).length) {
            i++
        }
        element = $("<div id='" + App.POPUP_PREFFIX_ID + "-" + i + "'>").dxPopup(this.configuration());
        App.AppElement().append(element);
        return element;
    }

    show() {
        this.instance().show()
    }

    setTitle(title) {
        this.setProperty("title", title);
    }

    close() {
        this.instance().hide();
        this.element().remove();
    }

}