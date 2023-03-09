const { _ } = require("lodash");
const cuid = require("cuid");
const simpleEncryptor = require("simple-encryptor");
const format = require('date-fns/format');
const es = require('date-fns/locale/es');

class Utils {

    static EncryptorKey = process.env.ENCRYPTOR_KEY;
    static Encryptor = simpleEncryptor(this.EncryptorKey);

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

    static GetProperty(object, path) {
        return _.get(object, path);
    }

    static SetProperty(object, path, value) {
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
            if (this.EqualsIgnoreCase(string, s)) {
                return true;
            }
        }
        return false;
    }

    static NoNulls(array) {
        return array.filter(
            e => e != undefined && e != null
        )
    }

    static Log(lines) {
        let text = "";
        lines.forEach(
            line => text += Strings.LineFeed() + line
        )
        console.log(text + Strings.LineFeed())
    }

    static Encrypt(s) {
        return this.Encryptor.encrypt(s);
    }

    static Decrypt(s) {
        return this.Encryptor.decrypt(s);
    }

    static HtmlTab(n = 1) {
        return "&emsp;".repeat(n);
    }

    static ZeroesLeft(n, z) {
        return n.toString().padStart(z, '0');
    }

    static TimeAsString(d) {
        return Utils.ZeroesLeft(d.getHours(), 2) + ":" + Utils.ZeroesLeft(d.getMinutes(), 2) + ":" + Utils.ZeroesLeft(d.getSeconds(), 2);
    }

}

class Strings {

    static Concatenate(array, separator = " ") {
        return Utils.NoNulls(array).join(separator);
    }

    static SingleQuotes(s) {
        return "'" + s + "'";
    }

    static DoubleQuotes(s) {
        return '"' + s + '"';
    }

    static LineFeed(count = 1) {
        return "\r\n".repeat(count);
    }

    static Capitalize(s) {
        return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
    }

}

class Dates {

    static Date() {
        return new Date();
    }

    static Now() {
        return new Date().getTime();
    }

    static TimeStamp() {
        return new Date().toUTCString();
    }

    static AddHours(date, hours) {
        return date.setHours(date.getHours() + hours)
    }

    static AddMinutes(date, minutes) {
        return date.setMinutes(date.getMinutes() + minutes);
    }

    static LowerOrEqual(d1, d2) {
        return d1 <= d2;
    }

    static Format(date) {
        return format(date, "dd MMM yyyy", { locale: es })
    }

    static YearOf(date) {
        return date.getFullYear();
    }

    static Between(d1, d2, d3) {
        return d2 <= d1 && d1 <= d3;
    }

    static Contains(d1, d2, d3, d4) {
        return d1 <= d3 && d2 >= d4
    }
    static Contained(d1, d2, d3, d4) {
        return d1 >= d3 && d2 <= d4
    }

    static Intersect(d1, d2, d3, d4) {
        return (d1 >= d3 && d1 <= d4) || (d2 >= d3 && d2 <= d4);
    }

}

module.exports.Strings = Strings;
module.exports.Utils = Utils;
module.exports.Dates = Dates;