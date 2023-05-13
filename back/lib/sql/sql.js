const { SqlInsert, SqlUpdate, SqlDelete, SqlCreate } = require("./sqloperations");
const { SqlText } = require("./sqltext");
const { SqlType } = require("./sqltype");
const { TextBuilder } = require("../utils/textbuilder");
const { SqlCount, SqlSelect } = require("./sqlselect");
const { Utils } = require("../utils/utils");
const { SqlAnd, SqlWhere } = require("./sqloperators");

const { escape } = require("sqlutils/pg");

class Sql {

    static Select(parameters) {
        return new SqlSelect(parameters).text();
    }

    static Count(parameters) {
        return new SqlCount(parameters).text();
    }

    static Where(parameters) {
        return new SqlWhere(parameters);
    }

    static And(parameters) {
        return new SqlAnd(parameters);
    }

    static Text(parameters) {
        return new SqlText(parameters).text();
    }

    static Value(value) {
        return escape(this.RawValue(value));
    }

    static RawValue(value) {
        if (Utils.IsNotDefined(value)) {
            return null
        } else if (Utils.IsString(value)) {
            return value.trimEnd()
        } else if (Utils.IsDate(value)) {
            return this.Date(value)
        } else {
            return value;
        }
    }

    static In(values) {
        let text = "";
        values.forEach(
            (value, i) => text += (0 < i ? "," : "") + this.Value(value)
        )
        return text;
    }

    static Like(value) {
        return "%" + value + "%"
    }

    static Create(parameters) {
        return new SqlCreate(parameters).text()
    }

    static DropCreate(parameters) {
        return new SqlDropCreate(parameters).text()
    }

    static Insert(parameters) {
        return new SqlInsert(parameters).text()
    }

    static Update(parameters) {
        return new SqlUpdate(parameters).text()
    }

    static Delete(parameters) {
        return new SqlDelete(parameters).text()
    }

    static Transact(sqls) {
        return new SqlCommands({ items: sqls }).transact();
    }

    static BeginTransaction() {
        return "start transaction";
    }

    static Commit() {
        return "commit";
    }

    static CreateSimple(tableName) {
        return new SqlCreate({
            tableName: tableName,
            columns: {
                nombre: SqlType.String()
            },
            unique: "nombre"
        })
    }

}

class SqlCommands extends TextBuilder {

    beforeItem(itemText, i) {
        if (i == 0) {
            return ""
        } else {
            return "; ";
        }
    }

    transact() {
        return this.addFirst(Sql.BeginTransaction()).add(Sql.Commit()).text();
    }

}

class Sqls extends SqlCommands { }

module.exports.Sql = Sql;
module.exports.SqlCommands = SqlCommands;
module.exports.Sqls = Sqls;