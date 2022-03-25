class Template {

    constructor(root) {
        this._root = root;
    }

    root() {
        return this._root;
    }

    findElement(className) {
        return this.root().find("." + className);
    }

    renderInto(element) {
        element.empty();
        this.root().appendTo(element);
    }

    html() {
        return this.root().html();
    }

    toggleVisibility(className) {
        Utils.ToggleVisibility(this.findElement(className));
    }

    isVisible(className) {
        return Utils.IsVisible(this.findElement(className));
    }

}