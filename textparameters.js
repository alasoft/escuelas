const { Utils } = require("./utils");

class TextParameters {

    constructor(parameters = {}) {
        this.text = parameters.text;
    }

    parameters() {
        if (this._parameters == undefined) {
            this.defineParameters()
        }
        return this._parameters;
    }

    defineParameters() {
        this._parameters = [];
        if (this.text.includes("@")) {
            this.index = -1;
            while (this.findNextParameter()) {
                this.addNextParameter();
            }
        }
    }

    findNextParameter() {
        while (this.hasNextChar() && this.nextChar() != "@") {}
        return (this.lastChar() == "@");
    }

    addNextParameter() {
        var name = "";
        while (this.hasNextChar() && this.nextChar().match(new RegExp("[a-z0-9_ñ]", "i"))) {
            name += this.lastChar();
        }
        if (name && !this.findParameter(name)) {
            this._parameters.push({
                name: name
            })
        }
    }

    hasNextChar() {
        return this.index < this.text.length - 1;
    }

    nextChar() {
        return this.text.charAt(++this.index);
    }

    lastChar() {
        return this.text.charAt(this.index);
    }

    findParameter(name) {
        return this._parameters.find(
            parameter => Utils.EqualsIgnoreCase(parameter.name, name)
        )
    }

}

module.exports.TextParameters = TextParameters;