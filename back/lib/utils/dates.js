const format = require('date-fns/format');
const es = require('date-fns/locale/es');

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

module.exports.Dates = Dates;