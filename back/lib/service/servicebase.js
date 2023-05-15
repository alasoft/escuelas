const { Exceptions, } = require("../utils/exceptions.js");
const { Sql } = require("../sql/sql");
const { Utils, Strings, Dates } = require("../utils/utils");
const { ObjectBase } = require("../utils/objectbase.js");
const {
    SqlInsert,
    SqlUpdate,
    SqlDelete,
    SqlUpdateWhere,
    SqlDeleteWhere,
    SqlDeleteAll
} = require("../sql/sqloperations.js");
const { SqlCount } = require("../sql/sqlselect.js");

class ServiceBase extends ObjectBase {

    constructor(parameters) {
        super(parameters)

        this.app = this.parameters.app;
        this.req = this.parameters.req;
        this.res = this.parameters.res;

        this.db = this.app.db;
        this.demo = this.app.demo;

    }

    user() {
        return this.req._user;
    }

    tenant() {
        const user = this.user();
        if (user != undefined) {
            return user.tenant;
        }
    }

    values() {
        return this.req.body;
    }

    id() {
        return this.values().id;
    }

    value(name) {
        return this.values()[name];
    }

    isDemo() {
        return this.demo == true;
    }

    isDefined(name) {
        return this.value(name) != undefined;
    }

    isNotDefined(name) {
        return !this.isDefined(name);
    }

    setValue(name, value) {
        this.values()[name] = value;
    }

    date(name) {
        const value = this.value(name);
        if (value != undefined) {
            return new Date(value);
        }
    }

    oneSpace(name) {
        const value = this.value(name);
        if (value != undefined) {
            return Strings.OneSpace(value)
        }
    }

    trimOneSpace(name) {
        const value = this.oneSpace(name);
        if (value != undefined) {
            return value.trim()
        }
    }

    trim(name) {
        const value = this.value(name);
        if (value != undefined) {
            return value.trim()
        }
    }

    formatedDate(name) {
        return Dates.Format(this.date(name));
    }

    validate() {
        return this.validateRequiredValues();
    }

    validateRequiredValues() {
        return new Promise((resolve, reject) => {
            const requiredValues = this.requiredValues();
            if (requiredValues != undefined) {
                for (const name of requiredValues.split(",")) {
                    if (this.value(name) == undefined) {
                        throw Exceptions.RequiredValue({ message: name })
                    }
                }
            }
            resolve(true);
        })
    }

    requiredValues() { }

    sqlAnd(items) {
        return Sql.And({ items: items });
    }

    sqlText(items, values) {
        return Sql.Text({ items: items, values: values });
    }

    sqlIn(columnName, values) {
        return columnName + " in (" + Sql.In(values) + ")";
    }

    sqlLike(value) {
        return Sql.Like(value)
    }

    sqlSelect(parameters) {
        if (Utils.IsNotDefined(parameters.tenant)) {
            parameters.tenant = this.tenant();
        }
        return Sql.Select(parameters);
    }

    sqlInsert(parameters) {
        this.defineValuesToSendInsert(parameters);
        return new SqlInsert(parameters).text()
    }

    sqlUpdate(parameters) {
        this.defineValuesToSend(parameters);
        return new SqlUpdate(parameters).text()
    }

    sqlUpdateWhere(parameters) {
        this.defineValuesToSend(parameters);
        return new SqlUpdateWhere(parameters).text();
    }

    sqlDelete(parameters) {
        this.defineValuesToSend(parameters);
        return new SqlDelete(parameters).text()
    }

    sqlDeleteWhere(parameters) {
        this.defineValuesToSend(parameters, false);
        return new SqlDeleteWhere(parameters).text();
    }

    sqlDeleteAll(parameters) {
        if (Utils.IsNotDefined(parameters.values.tenant)) {
            parameters.values.tenant = this.tenant();
        }
        return new SqlDeleteAll(parameters).text()
    }

    sqlCount(parameters) {
        if (Utils.IsNotDefined(parameters.tenant)) {
            parameters.tenant = this.tenant();
        }
        return new SqlCount(parameters).text();
    }

    defineValuesToSend(parameters, checkId = true) {
        if (Utils.IsNotDefined(parameters.values)) {
            parameters.values = {};
        }
        if (checkId && Utils.IsNotDefined(parameters.values.id)) {
            parameters.values.id = this.id();
        }
        if (Utils.IsNotDefined(parameters.values.tenant)) {
            parameters.values.tenant = this.tenant();
        }
        this.valuesToSend = parameters.values;
    }

    defineValuesToSendInsert(parameters) {
        this.defineValuesToSend(parameters);
        if (Utils.IsNotDefined(this.valuesToSend.id)) {
            this.valuesToSend.id = Strings.NewGuid()
        }
    }

    sendOkey(data) {
        this.res.json(data);
    }

    sendIdDto() {
        this.sendOkey(this.idDto());
    }

    idDto() {
        return { id: this.valuesToSend.id };
    }

    sendError(err) {
        this.app.sendError(this.req, this.res, err);
    }

    jsonValues(names) {
        const json = {};
        const properties = names.split(",")
        properties.forEach(
            property => json[property] = this.value(property, true)
        )
        return json;
    }

    jsonValuesWithTenant(names) {
        const json = this.jsonValues(names);
        json.tenant = this.tenant();
        return json;
    }

    dbSelect(sql) {
        return this.db.select(sql, this);
    }

    dbSelectOne(sql) {
        return this.db.selectOne(sql, this);
    }

    dbExecute(sql) {
        return this.db.execute(sql, this);
    }

    dbCount(sql) {
        return this.db.count(sql, this);
    }

    dbExists(sql) {
        return this.db.exists(sql, this);
    }

    concatenate(p = {}) {
        const names = p.names.split(",");
        const values = names.map(name => this.value(name));
        const concatenate = Strings.Concatenate(values, p.separator || ", ");
        return p.singleQuotes != false ? Strings.SingleQuotes(concatenate) : concatenate;
    }

    clientDescription() {
        return this.req.headers.client_description;
    }

}

module.exports.ServiceBase = ServiceBase;