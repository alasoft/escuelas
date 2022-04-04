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

}