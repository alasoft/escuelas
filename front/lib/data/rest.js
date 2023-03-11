class Rest extends ObjectBase {

    constructor(parameters) {
        super(parameters);
        this.path = parameters.path;
        this.transformData = parameters.transformData;
    }

    list() {
        return this.promise({ verb: "list" })
    }

    get(data) {
        return this.promise({ verb: "get", data: data })
    }

    insert(data) {
        return this.promise({ verb: "insert", data: data })
    }

    update(data) {
        return this.promise({ verb: "update", data: data })
    }

    delete(data) {
        return this.promise({ verb: "delete", data: data })
    }

    promise(parameters) {
        const url = App.Url(this.path, parameters.verb);
        const type = "POST";
        const data = this.data(parameters.verb, parameters.data);
        //        const data = this.dataToString(parameters.verb, parameters.data);
        return new Promise((resolve, reject) => $.ajax({
            url: url,
            headers: this.headers(parameters.verb),
            type: type,
            data: JSON.stringify(data),
            success: data =>
                resolve(data),
            error: err => {
                //                new RestError({ err: err, url: url, type: type, data: data });
                reject(Errors.ErrorObject(err))
            }
        }))
    }

    data(verb, data) {
        if (Utils.IsEmptyObject(data)) {
            return undefined;
        } else {
            let dataTransformed = data;
            if (this.transformData != undefined && Strings.StringIs(verb, ["insert", "update"])) {
                dataTransformed = this.transformData(verb, data);
            }
            return dataTransformed;
        }
    }

    dataToString(verb, data) {
        if (Utils.IsEmptyObject(data)) {
            return undefined;
        } else {
            let dataTransformed = data;
            if (this.transformData != undefined && Strings.StringIs(verb, ["insert", "update"])) {
                dataTransformed = this.transformData(verb, data);
            }
            return JSON.stringify(dataTransformed);
        }
    }

    headers(verb) {
        return Utils.Merge(this.class().Headers, {
                token: App.GetToken()
            },
            Utils.Evaluate(this.parameters.headers, verb))
    }

    static Headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    static Promise(parameters) {
        const url = App.Url(parameters.path);
        const data = Utils.IsEmptyObject(parameters.data) ? undefined : JSON.stringify(parameters.data);
        const headers = Utils.Merge(this.Headers, { token: App.GetToken() })
        return new Promise((resolve, reject) => $.ajax({
            url: url,
            headers: headers,
            data: data,
            type: "POST",
            dataType: "json",
            success: data =>
                resolve(data),
            error: err => {
                reject(Errors.ErrorObject(err))
            }

        }))
    }

}