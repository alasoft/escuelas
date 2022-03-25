const { Exceptions } = require("../utils/exceptions");
const { TextBuilder } = require("../utils/textbuilder");
const { TextParameters } = require("../utils/textparameters");
const { Utils } = require("../utils/utils");

class SqlText {

    Sql = require("./sql").Sql;

    constructor(parameters = {}) {
        this.items = Utils.ToArray(parameters.items)
        this.values = parameters.values || {};
    }

    text() {
        let text = this.originalText();
        this.parameters().forEach(parameter => {
            text = text.replace(
                new RegExp("@" + parameter.name, "ig"),
                this.Sql.Value(this.getParameterValue(parameter.name))
            )
        })
        return text;
    }

    originalText() {
        if (this._originalText == undefined) {
            this._originalText = this.defineOriginalText();
        }
        return this._originalText;
    }

    defineOriginalText() {
        return new TextBuilder({ items: this.items }).text();
    }

    parameters() {
        if (this._parameters == undefined) {
            this._parameters = this.defineParameters();
        }
        return this._parameters;
    }

    defineParameters() {
        return new TextParameters({ text: this.originalText() }).parameters();
    }

    getParameterValue(name) {
        let key = Object.keys(this.values).find(
            key => Utils.EqualsIgnoreCase(key, name)
        )
        if (key != undefined) {
            return this.values[key];
        } else {
            throw Exceptions.ParameterValueNotFound(name)
        }
    }

}

module.exports.SqlText = SqlText;