const { ObjectBase } = require("./objectbase");
const { SqlType } = require("./sqltype");
const { TextBuilder } = require("./textbuilder");

class SqlCreate {

    constructor(parameters) {
        this.tableName = parameters.tableName;
        this.columns = parameters.columns;
        this.addDefaults();
    }

    addDefaults() {
        this.columns.id = SqlType.Pk();
        this.columns.created = SqlType.Created();
        this.columns.updated = SqlType.Updated({ required: false })
        this.columns.state = SqlType.State();
        this.columns.tenant = SqlType.Tenant();
    }

    text() {
        const textBuilder = new TextBuilder()
            .add("create table")
            .add("if not exists")
            .add(this.tableName)
            .add("(");
        Object.keys(this.columns).forEach(
            (key, i) => textBuilder.add((0 < i ? ", " : "") + key + " " + this.columns[key])
        )
        return textBuilder
            .add(")")
            .text();
    }

}

module.exports.SqlCreate = SqlCreate;