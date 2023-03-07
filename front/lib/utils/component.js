class Component extends ObjectBase {

    element() {
        if (this._element == undefined) {
            this._element = this.defineElement();
        }
        return this._element;
    }

    defineElement() {
        return this.configuration().element || this.defaultElement();
    }

    defaultElement() {
        return App.ViewElement();
    }

    html() {
        return this.element()[0].outerHTML;
    }

}