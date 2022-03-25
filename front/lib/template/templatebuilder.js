class TemplateBuilder {

    root(parameters) {
        if (this._root == undefined) {
            this._root = new TemplateItem(parameters);
        }
        return this._root;
    }

}

class TemplateItem {

    constructor(parameters = {}) {
        if (Utils.IsString(parameters)) {
            parameters = { cssClassNames: parameters }
        }
        this._items = [];
        this._parent = parameters.parent;
        this._tag = parameters.tag || App.TEMPLATE_TAG_DEFAULT;
        this._cssClassNames = parameters.cssClassNames;
    }

    add(parameters) {
        this.addChild(parameters);
        return this;
    }

    addChild(parameters) {
        if (Utils.IsString(parameters)) {
            parameters = { cssClassNames: parameters }
        }
        return this._items[this._items.push(new TemplateItem(Utils.Merge(parameters, { parent: this }))) - 1];
    }

    up() {
        return this._parent;
    }

    element() {
        let element = $(this._tag).addClass(this._cssClassNames);
        this._items.forEach(
            item => element.append(item.element())
        )
        return element;
    }

    root() {
        let root = this;
        while (root._parent != undefined) {
            root = root._parent;
        }
        return root;
    }

    build() {
        return new Template(this.root().element());
    }

}