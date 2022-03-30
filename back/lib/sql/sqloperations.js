const { Dates } = require("../utils/dates");
const { DbStates } = require("../data/dbstates");
const { Exceptions } = require("../utils/exceptions.js");
const { TextBuilder } = require("../utils/textbuilder");
const { Utils } = require("../utils/utils");

class SqlOperation {

    Sql = require("./sql").Sql;

    constructor(parameters) {
        this.tableName = parameters.tableName;
        this.values = parameters.values;
        this.checkValues();
    }

    checkValues() {
        if (Utils.IsNotDefined(this.values.tenant)) {
            throw Exceptions.TenantNotDefined()
        }
        if (Utils.IsNotDefined(this.values.id)) {
            Exceptions.IdNotDefined()
        }
    }

}

class SqlInsert extends SqlOperation {

    checkValues() {
        super.checkValues();
        if (Utils.IsNotDefined(this.values.state)) {
            this.values.state = DbStates.Active;
        }
        this.values.created = Dates.TimeStamp();
    }

    text() {
        const textBuilder = new TextBuilder()
            .add("insert")
            .add("into")
            .add(this.tableName)
            .add("(");
        Object.keys(this.values).forEach(
            (key, i) => textBuilder.add((0 < i ? ", " : "") + key)
        )
        textBuilder.add(")")
            .add("values")
            .add("(");
        Object.keys(this.values).forEach(
            (key, i) => textBuilder.add((0 < i ? ", " : "") + this.Sql.Value(this.values[key]))
        )
        return textBuilder
            .add(")")
            .text();
    }

}

class SqlWhereTenantId extends SqlOperation {

    whereTenantId() {
        return new TextBuilder()
            .add("where")
            .add("tenant=" + this.Sql.Value(this.values.tenant))
            .add("and")
            .add("id=" + this.Sql.Value(this.values.id))
            .text();
    }

}

class SqlUpdate extends SqlWhereTenantId {

    checkValues() {
        super.checkValues();
        this.values.updated = Dates.TimeStamp();
    }

    text() {
        const textBuilder = new TextBuilder()
            .add("update")
            .add(this.tableName)
            .add("set")
        Object.keys(this.values)
            .filter(key =>
                !Utils.StringIs(key, ["tenant", "id"]))
            .forEach(
                (key, i) => {
                    textBuilder.add((0 < i ? ", " : "") + key.toLowerCase() + "=" + this.Sql.Value(this.values[key]))
                }
            )
        return textBuilder
            .add(this.whereTenantId())
            .text();
    }

}


class SqlDelete extends SqlWhereTenantId {

    text() {
        return new TextBuilder()
            .add("delete from")
            .add(this.tableName)
            .add(super.whereTenantId())
            .text();
    }

}

module.exports.SqlInsert = SqlInsert;
module.exports.SqlUpdate = SqlUpdate;
module.exports.SqlDelete = SqlDelete;