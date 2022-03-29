class Utils {

    static IsDefined(x) {
        return x != undefined && x != null;
    }

    static IsNotDefined(x) {
        return !this.IsDefined(x);
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

    static Merge(...parameters) {
        return $.extend(true, {}, ...parameters);
    }

    static NewGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            c => {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }
        );
    }

    static RandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static Delay(miliseconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(true), miliseconds)
        })
    }

    static Evaluate(x) {
        if (this.IsFunction(x)) {
            return x();
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

    static Capitalize(s) {
        return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
    }

    static NoNulls(array) {
        return array.filter(
            e => e != undefined && e != null
        )
    }

    static ToggleVisibility(element, cssVisible = "flex") {
        const isVisible = element.css("display") != "none";
        element.css("display", isVisible ? "none" : cssVisible);
        return !isVisible;
    }

    static Concatenate(array, separator = " ") {
        return this.NoNulls(array).join(separator);
    }

    static EmptyPromise() {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }

    static ReduceIds(object) {
        Object.keys(object).forEach(
            key => {
                const value = object[key];
                if (this.IsObject(value)) {
                    object[key] = value.id;
                }
            }
        )
        return object;
    }

    static HtmlLines(lines) {
        let text = "";
        lines.forEach(
            (line, i) => text += (0 < i ? "<br>" : "") + (Utils.IsDefined(line) ? line : "")
        )
        return text;
    }

    static StringIs(string, strings) {
        for (const s of strings) {
            if (Utils.EqualsIgnoreCase(string, s)) {
                return true;
            }
        }
        return false;
    }

    static EqualsIgnoreCase(s1, s2) {
        return (s1.toLowerCase() == s2.toLowerCase());
    }

    static Occurences(s1, s2) {
        return s1.split(s2).length - 1;
    }

}