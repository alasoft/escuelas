const { Utils } = require("./utils");

class TextBuilder {

    constructor(parameters = {}) {
        this.items = Utils.ToArray(parameters.items);
    }

    add(item) {
        this.items.push(item);
        return this;
    }

    addIf(condition, item) {
        if (condition) {
            this.add(item);
        }
        return this;
    }

    addFirst(item) {
        this.items.unshift(item);
        return this;
    }

    addFirstIf(condition, item) {
        if (condition) {
            this.addFirst(item);
        }
        return this;
    }

    text() {
        if (this._text == undefined) {
            this._text = this.defineText();
        }
        return this._text;
    }

    defineText() {
        let text;
        if (0 < this.finalItems().length) {
            text = "";
            this.finalItems().forEach(
                (item, i) => text += this.beforeItem(item, i) + this.itemToText(item, i) + this.afterItem(item, i)
            )
        }
        return this.finalText(text, this.finalItems().length)
    }

    finalItems() {
        if (this._finalItems == undefined) {
            this._finalItems = this.defineFinalItems();
        }
        return this._finalItems;
    }

    defineFinalItems() {
        const finalItems = this.items
            .map(item =>
                this.itemToText(item))
            .filter(item =>
                Utils.IsDefined(item));
        return finalItems;
    }

    beforeItem(item, i) {
        if (i == 0) {
            return ""
        } else {
            return " "
        }
    }

    itemToText(item, i) {
        if (Utils.IsFunction(item)) {
            return this.itemToText(item(), i);
        } else if (Utils.IsObject(item)) {
            return item.text()
        } else {
            return item;
        }
    }

    afterItem(item, i) {
        return "";
    }

    finalText(text, itemCount) {
        return text;
    }

}

module.exports.TextBuilder = TextBuilder;