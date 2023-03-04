const { DbStates } = require("../data/dbstates");
const { Dates } = require("../utils/dates");
const { Exceptions } = require("../utils/exceptions");
const { TextBuilder } = require("../utils/textbuilder");
const { Utils } = require("../utils/utils");
const { SqlWhere } = require("./sqloperators");
const { SqlType } = require("./sqltype");

class SqlCreate {

    constructor(parameters) {
        this.tableName = parameters.tableName;
        this.columns = parameters.columns;
        this.addDefaults();
    }

    addDefaults() {
        this.columns.id = SqlType.Pk();
        this.columns._created = SqlType.Created();
        this.columns._updated = SqlType.Updated({ required: false })
        this.columns._state = SqlType.State();
        this.columns.tenant = SqlType.Tenant();
    }

    text() {
        const textBuilder = new TextBuilder()
            .add("create table")
            .add("if not exists")
            .add(this.tableName)
            .add("(");
        Object.keys(this.columns).forEach(
            (key, i) => textBuilder.add((0 < i ? ", " : "") + Utils.DoubleQuotes(key) + " " + this.columns[key])
        )
        return textBuilder
            .add(")")
            .text();
    }

}

class SqlDropCreate extends SqlCreate {

    SqlCommands = require("./sql").SqlCommands;

    text() {
        return new this.SqlCommands()
            .add("drop table " + this.tableName)
            .add(super.text())
            .text()
    }

}

class SqlBaseCrud {

    constructor(parameters) {
        this.tableName = parameters.tableName;
        this.values = parameters.values;
        this.where = parameters.where;
        this.validateRequired();
        this.setValuesDefault();
    }

    validateRequired() {
        this.tenantRequired();
    }

    setValuesDefault() {}

    tenantRequired() {
        if (Utils.IsNotDefined(this.values.tenant)) {
            throw Exceptions.TenantNotDefined()
        }
    }

    idRequired() {
        if (Utils.IsNotDefined(this.values.id)) {
            throw Exceptions.IdNotDefined()
        }
    }

    whereRequired() {
        if (Utils.IsNotDefined(this.where)) {
            Exceptions.WhereNotDefined();
        }
    }

    whereTenant() {
        return "tenant=" + Utils.SingleQuotes(this.values.tenant);
    }

    whereId() {
        return "id=" + Utils.SingleQuotes(this.values.id);
    }

    sqlWhere() {
        return new SqlWhere().add(this.whereTenant());
    }

}

class SqlInsert extends SqlBaseCrud {

    Sql = require("../sql/sql").Sql;

    setValuesDefault() {
        super.setValuesDefault();
        if (Utils.IsNotDefined(this.values.id)) {
            this.values.id = Utils.NewGuid();
        }
        if (Utils.IsNotDefined(this.values._state)) {
            this.values._state = DbStates.Active;
        }
        this.values._created = Dates.TimeStamp();
    }

    text() {
        const textBuilder = new TextBuilder()
            .add("insert")
            .add("into")
            .add(this.tableName)
            .add("(");
        Object.keys(this.values).forEach(
            (key, i) => textBuilder.add((0 < i ? ", " : "") + Utils.DoubleQuotes(key))
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

class SqlBaseUpdate extends SqlBaseCrud {

    Sql = require("../sql/sql").Sql;

    setValuesDefault() {
        super.setValuesDefault();
        this.values._updated = Dates.TimeStamp();
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
            .add(this.sqlWhere())
            .text();
    }

}

class SqlUdpate extends SqlBaseUpdate {

    validateRequired() {
        super.validateRequired();
        this.idRequired();
    }

    sqlWhere() {
        return super.sqlWhere().add(this.whereId());
    }

}

class SqlUpdateWhere extends SqlBaseUpdate {

    validateRequired() {
        super.validateRequired();
        this.whereRequired();
    }

    sqlWhere() {
        return super.sqlWhere().add(this.where)
    }

}

class SqlBaseDelete extends SqlBaseCrud {

    text() {
        return new TextBuilder()
            .add("delete from")
            .add(this.tableName)
            .add(this.sqlWhere())
            .text();
    }

}

class SqlDelete extends SqlBaseDelete {

    validateRequired() {
        super.validateRequired();
        this.idRequired();
    }

    sqlWhere() {
        return super.sqlWhere().add(this.whereId());
    }

}

class SqlDeleteWhere extends SqlBaseDelete {

    validateRequired() {
        super.validateRequired();
        this.whereRequired();
    }

    sqlWhere() {
        return super.sqlWhere().add(this.where)
    }

}

module.exports.SqlCreate = SqlCreate;
module.exports.SqlDropCreate = SqlDropCreate;
module.exports.SqlInsert = SqlInsert;
module.exports.SqlUpdate = SqlUdpate;
module.exports.SqlUpdateWhere = SqlUpdateWhere;
module.exports.SqlDelete = SqlDelete;
module.exports.SqlDeleteWhere = SqlDeleteWhere;