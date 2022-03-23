const { SqlAnd } = require("./sqland");
const { SqlCreate } = require("./sqlcreate");
const { SqlInsert, SqlUpdate, SqlDelete } = require("./sqloperations");
const { SqlText } = require("./sqltext");
const { SqlType } = require("./sqltype");
const { TextBuilder } = require("./textbuilder");
const { SqlCount, SqlSelect } = require("./sqlselect");
const { Utils } = require("./utils");

const { escape } = require("sqlutils/pg");

class Sql {

    static Select(parameters) {
        return new SqlSelect(parameters).text();
    }

    static Count(parameters) {
        return new SqlCount(parameters).text();
    }

    static And(parameters) {
        new SqlAnd(parameters).text()
    }

    static Text(parameters) {
        return new SqlText(parameters).text();
    }

    static Value(value) {
        return escape(this.RawValue(value));
    }

    static RawValue(value) {
        if (Utils.IsNotDefined(value)) {
            return "NULL"
        } else if (Utils.IsString(value)) {
            return value
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

    static Create(parameters) {
        return new SqlCreate(parameters).text()
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
            }
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

    transact(lines) {
        return this.addFirst(Sql.BeginTransaction()).add(Sql.Commit()).text();
    }

}

module.exports.Sql = Sql;