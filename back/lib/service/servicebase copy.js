const { Exceptions, } = require("../utils/exceptions.js");
const { Sql } = require("../sql/sql");
const { Utils, Strings } = require("../utils/utils");
const { ObjectBase } = require("../utils/objectbase.js");

class ServiceBase extends ObjectBase {

    constructor(parameters) {
        super(parameters)

        this.app = this.parameters.app;
        this.req = this.parameters.req;
        this.res = this.parameters.res;

        this.db = this.app.db;

    }

    user() {
        return this.req.user;
    }

    tenant() {
        return this.user().tenant;
    }

    values() {
        return this.req.body;
    }

    id() {
        return this.values().id;
    }

    value(name) {
        return Utils.GetValue(this.values(), name);
    }

    date(name) {
        const value = this.value(name);
        if (value != undefined) {
            return new Date(value);
        }
    }

    setValue(name, value) {
        Utils.SetValue(this.values(), name, value);
    }

    isDefined(name) {
        return this.value(name) != undefined;
    }

    isNotDefined(name) {
        return !this.isDefined(name);
    }

    sqlAnd(items) {
        return Sql.And({ items: items });
    }

    sqlText(items, values) {
        return Sql.Text({ items: items, values: values });
    }

    sqlLike(value) {
        return Sql.Like(value)
    }

    sqlSelect(parameters) {
        parameters.tenant = this.tenant()
        return Sql.Select(parameters);
    }

    sqlInsert(parameters) {
        return Sql.Insert(this.valuesWithTenantAndId(parameters))
    }

    sqlUpdate(parameters) {
        return Sql.Insert(this.valuesWithTenant(parameters))
    }

    sqlDelete(parameters) {
        return Sql.Delete(this.valuesWithTenant(parameters))
    }

    valuesWithTenant(parameters) {
        parameters.values.tenant = this.tenant();
        return parameters;
    }

    valuesWithTenantAndId(parameters) {
        parameters = this.valuesWithTenant(parameters);
        if (parameters.values.id == undefined) {
            parameters.values.id = Strings.NewGuid()
        }
        return parameters;
    }

    sendOkey(data) {
        this.res.json(data);
    }

    sendIdDto() {
        this.sendOkey(this.idDto());
    }

    idDto() {
        return { id: this.id() };
    }

    sendError(err) {
        this.app.sendError(this.req, this.res, err);
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
                        throw Exceptions.RequiredValue(name)
                    }
                }
            }
            resolve(true);
        })
    }

    requiredValues() {}

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
        this.log(sql);
        return this.db.select(sql);
    }

    dbSelectOne(sql) {
        this.log(sql);
        return this.db.selectOne(sql);
    }

    dbExecute(sql) {
        this.log(sql);
        return this.db.execute(sql);
    }

    dbCount(sql) {
        this.log(sql);
        return this.db.count(sql);
    }

    dbExists(sql) {
        this.log(sql)
        return this.db.exists(sql);
    }

    log(sql) {
        //        this.app.log(sql, this.req);
    }

}

module.exports.ServiceBase = ServiceBase;