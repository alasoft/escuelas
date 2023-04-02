class Utils {

    static IsDefined(x) {
        return x != undefined && x != null;
    }

    static IsNotDefined(x) {
        return !this.IsDefined(x);
    }

    static IfDefined(x1, x2) {
        if (this.IsDefined(x1)) {
            return x2;
        }
    }

    static IfNotDefined(x1, x2) {
        if (this.IsDefined(x1)) {
            return x1;
        } else {
            return x2;
        }
    }

    static IsString(x) {
        return (typeof x === "string");
    }

    static IsObject(x) {
        return (x instanceof Object && !(x instanceof Date))
    }

    static IsFunction(x) {
        return (typeof x === "function");
    }

    static IsArray(x) {
        return Array.isArray(x);
    }

    static Merge(...parameters) {
        return $.extend(true, {}, ...parameters);
    }

    static RandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static Delay(miliseconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(true), miliseconds)
        })
    }

    static Evaluate(x, ...parameters) {
        if (this.IsFunction(x)) {
            return x(...parameters);
        } else {
            return x;
        }
    }

    static ReduceObject(o, properties) {
        const r = {};
        properties.forEach(
            p => r[p] = o[p]
        )
        return r;
    }

    static EmptyPromise() {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }

    static NormalizeData(data, dataFields) {
        const normalized = {}
        let keys = Object.keys(data);
        if (Utils.IsDefined(dataFields)) {
            if (!Utils.IsArray(dataFields)) {
                dataFields = dataFields.split(",");
            }
            keys = keys.filter(key => dataFields.includes(key))
        }
        keys.forEach(key => {
            let value = data[key];
            if (key == "id") {

            } else if (Utils.IsString(value)) {
                value = Strings.TrimOnSpace(value);
            } else if (Utils.IsObject(value)) {
                value = value.id
            }
            normalized[key] = value;
        })
        return normalized;
    }

    static ReduceId(x) {
        if (this.IsObject(x)) {
            return x.id;
        } else {
            return x;
        }
    }

    static Clone(object) {
        return Object.assign({}, object);
    }

    static IsEmptyObject(o) {
        return this.IsNotDefined(o) || Object.keys(o).length == 0;
    }

    static ToArray(x) {
        if (this.IsArray(x)) {
            return x;
        } else {
            return [x];
        }
    }

}

class Strings {

    static NewGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            c => {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }
        );
    }

    static Capitalize(s) {
        return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
    }

    static Concatenate(array, separator = " ") {
        return Arrays.NoNulls(array).join(separator);
    }

    static EqualsIgnoreCase(s1, s2) {
        return (s1.toLowerCase() == s2.toLowerCase());
    }

    static Occurences(s1, s2) {
        return s1.split(s2).length - 1;
    }

    static SingleQuotes(s, withQuotes = true) {
        if (Utils.IsDefined(s)) {
            if (withQuotes) {
                return "'" + s + "'";
            } else {
                return s;
            }
        } else {
            return "";
        }
    }

    /*    
        static StringIs(string, strings) {

            for (const s of this.ToArray(strings)) {
                if (this.EqualsIgnoreCase(string, s)) {
                    return true;
                }
            }
            return false;
        }
    */

    static ToArray(s) {
        if (Utils.IsArray(s)) {
            return s
        } else {
            return s.split(",");
        }
    }

    static Replace(s1, s2, s3) {
        return s1.replace(s2, s3);
    }

    static RemoveChars(s, chars) {
        chars.forEach(c => {
            s = s.replace(c, "");
        })
        return s;
    }

    static SubstringAfter(s, after) {
        let a = s.split(after);
        if (1 < a.length) {
            return a[1].split(" ")[1];
        } else {
            return "";
        }
    }

    static RemoveLastChar(s) {
        return str.substring(0, s.length - 1);
    }

    static Contains(s1, s2) {
        return s1.includes(s2);
    }

    static ZeroesLeft(n, z) {
        return n.toString().padStart(z, '0');
    }

    static OneSpace(s) {
        return s.replace(/\s\s+/g, ' ');
    }

    static TrimOnSpace(s) {
        return this.OneSpace(s).trim();
    }

}

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

    static Format(date, quotes = false) {
        let format = $.format.date(date, "dd MMM yyyy");
        if (quotes == true) {
            format = Strings.SingleQuotes(format)
        }
        return format;
    }

    static Between(d1, d2, d3) {
        return d2 <= d1 && d1 <= d3;
    }

    static ToDate(s) {
        return new Date(s);
    }

    static TimeAsString(d) {
        return Strings.ZeroesLeft(d.getHours(), 2) + ":" + Strings.ZeroesLeft(d.getMinutes(), 2) + ":" + Strings.ZeroesLeft(d.getSeconds(), 2);
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

class Arrays {

    static NoNulls(array) {
        return array.filter(
            e => e != undefined && e != null
        )
    }

    static ToDate(array, names) {
        array.forEach(e =>
            names.forEach(n =>
                e[n] = Dates.ToDate(e[n])
            )
        )
    }

}

class Html {

    static IsVisible(element) {
        return element.css("display") != "none";
    }

    static ToggleVisibility(element, cssVisible = "flex") {
        const isVisible = element.css("display") != "none";
        element.css("display", isVisible ? "none" : cssVisible);
        return !isVisible;
    }

    static Hide(element) {
        element.css("display", "none");
    }

    static Lines(lines) {
        let text = "";
        lines.forEach(
            (line, i) => text += (0 < i ? "<br>" : "") + (Utils.IsDefined(line) ? line : "")
        )
        return text;
    }

    static UnderlineTitle(title, plus = 7) {
        return title + "<br>" + "-".repeat(title.length + plus);
    }

    static LineFeed(n = 1) {
        if (0 < n) {
            return "<br>".repeat(n);
        } else {
            return ""
        }
    }

    static Tab(n) {
        if (0 < n) {
            return "&emsp;".repeat(n);
        } else {
            return "";
        }
    }

    static Bold() {
        return "<b>";
    }

    static BoldWithStyle(style) {
        return '<b style="' + style + '">';
    }

    static Italic() {
        return "<i>";
    }

}