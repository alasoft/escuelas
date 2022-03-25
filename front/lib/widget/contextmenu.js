class ContextMenu extends Widget {

    widgetName() {
        return "dxContextMenu"
    }

    setItems(items) {
        if (items != undefined) {
            this.setProperty("items", Utils.NoNulls(items));
        }
    }

}