const { TextBuilder } = require("../utils/textbuilder");
const { Utils } = require("../utils/utils");

class SqlText extends TextBuilder {

    Sql = require("./sql").Sql;

    constructor(parameters) {
        super(parameters);
        this.values = this.parameters.values;
    }

    text() {
        const text = this.setValues(super.text());
        return text;
    }

    setValues(text) {
        if (Utils.IsDefined(this.values)) {
            Object.keys(this.values).forEach(name =>
                text = text.replace(new RegExp("@" + name, "ig"), this.Sql.Value(this.values[name]))
            )
        }
        return text;
    }

}


module.exports.SqlText = SqlText;