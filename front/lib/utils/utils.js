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

    static ZeroesLeft(n, z) {
        return n.toString().padStart(z, '0');
    }

}