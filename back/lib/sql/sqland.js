const { TextBuilder } = require("../utils/textbuilder");

class SqlAnd extends TextBuilder {

    beforeItem(item, i) {
        if (i == 0) {
            return ""
        } else {
            return " AND ";
        }
    }

    finalText(text, itemCount) {
        if (1 < itemCount) {
            return "(" + text + ")";
        } else {
            return text;
        }
    }

}

module.exports.SqlAnd = SqlAnd;