class Template extends ObjectBase {

    element() {
        if (this._element == undefined) {
            this._element = this.defineElement();
        }
        return this._element;
    }

    defineElement() {
        const configuration = this.configuration();
        const element = $(configuration.tag || "<div>");
        element.attr("id", configuration.id);
        element.addClass(configuration.name);
        element.text(configuration.text)
        element.css(this.styles());
        this.addItemsElements(element);
        return element;
    }

    styles() {
        if (this._styles == undefined) {
            this._styles = this.defineStyles();
        }
        return this._styles;
    }

    defineStyles() {
        const configuration = this.configuration();
        const styles = {};
        Object.keys(configuration).forEach(
            key => {
                const functionName = "_" + key;
                if (this[functionName] != undefined && typeof this[functionName] == "function") {
                    Object.assign(styles, this[functionName](configuration[key]));
                }
            }
        )
        return styles;
    }

    items() {
        if (this._items == undefined) {
            this._items = this.defineItems();
        }
        return this._items;
    }

    defineItems() {
        const configuration = this.configuration()
        const items = [];
        if (configuration.items != undefined) {
            configuration.items.forEach(
                item => {
                    if (!(item instanceof Template)) {
                        item = new Template(item)
                    }
                    items.push(item)
                }
            )
        }
        return items;
    }

    addItemsElements(element) {
        this.items().forEach(
            item => element.append(item.element())
        )
    }

    findElementByClass(className) {
        if (this.element().hasClass(className)) {
            return this.element()
        } else {
            return this.element().find("." + className);
        }
    }

    html() {
        return this.element()[0].outerHTML;
    }

    appendTo(element) {
        if (element != "body") {
            element.empty();
        }
        this.element().appendTo(element);
    }

    _fillContainer(fillContainer) {
        if (fillContainer == true) {
            return {
                "flex": 1
            }
        }
    }

    _margin(margin) {
        return {
            "margin": margin
        }
    }

    _marginTop(margin) {
        return { "margin-top": margin }
    }

    _marginLeft(margin) {
        return { "margin-left": margin }
    }

    _marginBottom(margin) {
        return { "margin-bottom": margin }
    }

    _marginRight(margin) {
        return { "margin-right": margin }
    }

    _padding(padding) {
        return {
            "padding": padding
        }
    }

    _paddingLeft(padding) {
        return {
            "padding-left": padding
        }
    }

    _height(height) {
        return {
            "height": height
        }
    }

    _width(width) {
        return {
            "width": width
        }
    }

    _orientation(orientation) {
        if (Strings.EqualsIgnoreCase(orientation, "vertical")) {
            return {
                "display": "flex",
                "flex-direction": "column"
            }
        } else if (Strings.EqualsIgnoreCase(orientation, "horizontal")) {
            return {
                "display": "flex",
                "flex-direction": "row"
            }
        }
    }

    _backgroundColor(color) {
        return {
            "background-color": color
        }
    }

    _visible(visible) {
        if (visible == false) {
            return { display: "none" }
        } else if (visible == true) {
            return { visible: "block" }
        }
    }

}