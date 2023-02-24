const { ObjectBase } = require("../utils/objectbase");
const { DbStates } = require("../data/dbstates");
const { Exceptions } = require("../utils/exceptions.js");
const { TextBuilder } = require("../utils/textbuilder");
const { Utils } = require("../utils/utils");
const { SqlAnd, SqlWhere } = require("./sqloperators");

class SqlSelect extends ObjectBase {

    Sql = require("./sql").Sql;

    constructor(parameters = {}) {
        super(parameters);
        this.filterByTenant = parameters.filterByTenant != false;
        this.filterByStates = parameters.filterByStates || [DbStates.Active];
        this.tenant = parameters.tenant;
        this.distinct = parameters.distinct == true;
        this.columns = new SqlColumns({ sqlSelect: this, items: parameters.columns });
        this.joins = new SqlJoins({ sqlSelect: this, joins: parameters.joins });
        this.from = new SqlFrom(parameters.from);
        this.where = new SqlWhereSelect({ sqlSelect: this, items: parameters.where })
        this.order = new SqlOrder({ sqlSelect: this, items: parameters.order })
        this.values = parameters.parameters;
    }

    text() {
        this.checkTenant();
        return this.finalText();
    }

    checkTenant() {
        if (this.filterByTenant && Utils.IsNotDefined(this.tenant)) {
            throw Exceptions.TenantNotDefined(this.className() + " " + this.from.tableName)
        }
    }

    finalText() {
        if (this._finalText == undefined) {
            this._finalText = this.defineFinalText()
        }
        return this._finalText;
    }

    defineFinalText() {
        const finalText = this.Sql.Text({ items: this.rawText(), values: this.values });
        return finalText;
    }

    rawText() {
        if (this._rawText == undefined) {
            this._rawText = this.defineRawText()
        }
        return this._rawText;
    }

    defineRawText() {
        const rawText = new TextBuilder()
            .add(this.columns)
            .add(this.from)
            .add(this.joins)
            .add(this.where)
            .add(this.order)
            .text();
        return rawText;
    }

    tenantAndStateConditions(tenantColumn, stateColumn) {
        return new SqlAnd()
            .addIf(this.filterByTenant, () =>
                tenantColumn + "=" + Utils.SingleQuotes(this.tenant))
            .addIf(0 < this.filterByStates.length, () =>
                stateColumn + " in (" + this.Sql.In(this.filterByStates) + ")")
    }

    baseConditions() {
        return this.tenantAndStateConditions(this.fromColumn("tenant"), this.fromColumn("state"));
    }

    baseJoinConditions(sqlJoin) {
        return this.tenantAndStateConditions(sqlJoin.alias + ".tenant", sqlJoin.alias + ".state");
    }

    fromColumn(columnName) {
        if (Utils.IsDefined(this.from.alias)) {
            return this.from.alias + "." + columnName;
        } else {
            return columnName;
        }
    }

    selectAll() {
        if (Utils.IsDefined(this.from.alias)) {
            return this.from.alias + ".*"
        } else {
            return "*"
        }
    }

}

class SqlCount extends SqlSelect {

    constructor(parameters = {}) {
        super(parameters);
        this.columns = new SqlColumnsCount({ sqlSelect: this });
    }

}

class SqlColumnsCount {

    constructor(parameters) {
        this.sqlSelect = parameters.sqlSelect;
    }

    text() {
        return "select count(" + this.sqlSelect.selectAll() + ")";
    }

}

class SqlColumns extends TextBuilder {

    constructor(parameters) {
        super(parameters);
        this.sqlSelect = parameters.sqlSelect;
    }

    beforeItem(itemText, i) {
        if (i == 0) {
            return "select " + (this.sqlSelect.distinct ? "distinct " : "")
        } else {
            return ", ";
        }
    }

    finalText(text, itemCount) {
        if (itemCount == 0) {
            return "select " + this.sqlSelect.selectAll();
        } else {
            return text;
        }
    }

}

class SqlFrom {

    constructor(parameters) {
        if (Utils.IsString(parameters)) {
            this.splitTableNameAlias(parameters);
        } else {
            this.tableName = parameters.tableName;
            this.alias = parameters.alias;
        }
    }

    splitTableNameAlias(tableNameAlias) {
        const split = tableNameAlias.split(/\s+/);
        this.tableName = split[0];
        if (1 < split.length) {
            this.alias = split[1];
        }
    }

    text() {
        return "from " + this.tableName + (Utils.IsDefined(this.alias) ? " " + this.alias : "");
    }

}

class SqlWhereSelect extends SqlWhere {

    constructor(parameters) {
        super(parameters);
        this.sqlSelect = parameters.sqlSelect;
        this.add(this.sqlSelect.baseConditions());
    }

}

class SqlJoins extends TextBuilder {

    constructor(parameters = {}) {
        super(parameters);
        this.sqlSelect = parameters.sqlSelect;
        this.joins = parameters.joins || [];
        this.addJoins();
    }

    addJoins() {
        this.joins.forEach(
            join => this.add(new SqlJoin(Utils.Merge(join, { sqlSelect: this.sqlSelect })))
        )
    }

    tenant() {
        return this.sqlSelect.tenant;
    }

}

class SqlJoin {

    constructor(parameters) {
        this.sqlSelect = parameters.sqlSelect;
        this.tableName = parameters.tableName;
        this.alias = parameters.alias;
        this.columnName = parameters.columnName;
    }

    text() {
        return new TextBuilder()
            .add("left join")
            .add(this.tableName + " " + this.alias)
            .add("on")
            .add("(")
            .add(new SqlAnd()
                .add(this.sqlSelect.baseJoinConditions(this))
                .add(this.alias + ".id=" + this.columnName)
            )
            .add(")")
            .text();
    }

}

class SqlOrder extends TextBuilder {

    beforeItem(item, i) {
        if (i == 0) {
            return "order by "
        } else {
            return ", ";
        }
    }

}

module.exports.SqlSelect = SqlSelect;
module.exports.SqlCount = SqlCount;