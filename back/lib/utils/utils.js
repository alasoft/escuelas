const { _ } = require("lodash");
const cuid = require("cuid");
const { Dates } = require("../utils/dates");

class Utils {

    static IsDefined(x) {
        return (x != undefined && x != null);
    }

    static IsNotDefined(x) {
        return !this.IsDefined(x);
    }

    static IsString(x) {
        return _.isString(x);
    }

    static IsArray(x) {
        return _.isArray(x)
    }

    static IsDate(x) {
        return _.isDate(x);
    }

    static IsObject(x) {
        return _.isObject(x);
    }

    static IsFunction(x) {
        return _.isFunction(x);
    }

    static Merge(...objects) {
        return _.merge({}, ...objects);
    }

    static GetValue(object, path) {
        return _.get(object, path);
    }

    static SetValue(object, path, value) {
        _.set(object, path, value);
    }

    static ToArray(x) {
        if (this.IsArray(x)) {
            return x;
        } else if (this.IsNotDefined(x)) {
            return []
        } else {
            return [x];
        }
    }

    static NewGuid() {
        return cuid();
    }

    static BeginsWith(s1, s2) {
        return (s2.length <= s1.length && s1.substring(0, s2.length) == s2);
    }

    static EqualsIgnoreCase(s1, s2) {
        return (s1.toLowerCase() == s2.toLowerCase());
    }

    static NewToken(minutes) {
        return { value: this.NewGuid(), until: Dates.AddMinutes(Dates.Date(), minutes) };
    }

    static Contains(s1, s2, ignoreCase = true) {
        if (ignoreCase == true) {
            return s1.toUpperCase().includes(s2.toUpperCase())
        } else {
            return s1.includes(s2);
        }
    }

    static StringIs(string, strings) {
        for (const s of strings) {
            if (Utils.EqualsIgnoreCase(string, s)) {
                return true;
            }
        }
        return false;
    }

    static SingleQuotes(s) {
        return "'" + s + "'";
    }

    static LineFeed() {
        return "\r\n";
    }

}

module.exports.Utils = Utils;