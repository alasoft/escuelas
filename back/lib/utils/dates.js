const { compareAsc, format } = require('date-fns');

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
        return format(new Date(date), "dd-MMM-yyyy")
    }

    static YearOf(date) {
        return new Date(date).getFullYear();
    }

}

module.exports.Dates = Dates;