const { Exceptions } = require("../utils/exceptions");
const { Sql } = require("../sql/sql");
const { Utils } = require("../utils/utils");

class ServiceBase {

    constructor(parameters) {
        this.parameters = parameters;

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
        return Sql.Select(Utils.Merge(parameters, { tenant: this.tenant() }))
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
        this.app.sendError(this.res, err);
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

}

module.exports.ServiceBase = ServiceBase;