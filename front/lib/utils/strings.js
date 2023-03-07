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

    static SingleQuotes(s) {
        if (Utils.IsDefined(s)) {
            return "'" + s + "'";
        } else {
            return "";
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

}