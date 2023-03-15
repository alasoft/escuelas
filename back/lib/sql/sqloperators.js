const { TextBuilder } = require("../utils/textbuilder");
const { SqlText } = require("./sqltext");

class SqlWhere extends TextBuilder {

    beforeItem(itemText, i) {
        if (i == 0) {
            return "where ("
        } else {
            return " and ";
        }
    }

    finalText(text, itemCount) {
        if (0 < itemCount) {
            return text + ")";
        }
    }

}

class SqlAnd extends TextBuilder {

    addSql(sql, parameters) {
        return this.add(new SqlText({ items: sql, values: parameters }))
    }

    beforeItem(item, i) {
        if (i == 0) {
            return ""
        } else {
            return " and ";
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

module.exports.SqlWhere = SqlWhere;
module.exports.SqlAnd = SqlAnd;