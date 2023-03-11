class Dates {

    static New(date) {
        if (date) {
            return new Date(date);
        } else {
            return new Date();
        }
    }

    static Today() {
        return new Date();
    }

    static ThisYear() {
        return new Date().getFullYear();
    }

    static AddDays(date, days) {
        const newDate = Dates.New(date)
        return new Date(newDate.setDate(newDate.getDate() + days));
    }

    static SetTime(date, time) {
        const a = time.split(":")
        const hour = parseInt(a[0]);
        const minutes = parseInt(a[1]);
        const seconds = parseInt(a[2]);
        return new Date(date.setHours(hour, minutes, seconds));
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

    static DateFromDayOfWeek(date, day) {
        const firstDayOfWeek = this.FirstDayOfWeek(date);
        const dateFromDay = this.AddDays(firstDayOfWeek, day - 1);
        return dateFromDay;
    }

    static FirstDayOfWeek(date) {
        const newDate = Dates.New(date);
        const day = newDate.getDay() || 7;
        if (day != 1) {
            newDate.setHours(-24 * (day - 1));
        }
        return newDate;
    }

}