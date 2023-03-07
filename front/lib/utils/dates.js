class Dates {

    static Today() {
        return new Date();
    }

    static ThisYear() {
        return new Date().getFullYear();
    }

    static AddDays(date, days) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
    }

    static TodayPlusDays(days) {
        return this.AddDays(this.Today(), days);
    }

    static Format(date) {
        return $.format.date(date, "dd MMM yyyy");
    }

    static Between(d1, d2, d3) {
        return d2 <= d1 && d1 <= d3;
    }

    static ToDate(s) {
        return new Date(s);
    }

    static TimeAsString(d) {
        return Utils.ZeroesLeft(d.getHours(), 2) + ":" + Utils.ZeroesLeft(d.getMinutes(), 2) + ":" + Utils.ZeroesLeft(d.getSeconds(), 2);
    }

    static DateFromHour(h) {
        return new Date(App.BASE_DATE + " " + h);
    }

}