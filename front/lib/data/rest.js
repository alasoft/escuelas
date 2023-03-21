class Rest {

    constructor(parameters) {
        this.path = parameters.path;
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
        const headers = this.headers(parameters.verb);
        const type = "POST";
        const data = Utils.IsEmptyObject(parameters.data) ? undefined : parameters.data;
        return new Promise((resolve, reject) => $.ajax({
            url: url,
            headers: headers,
            type: type,
            data: JSON.stringify(data),
            success: data =>
                resolve(data),
            error: err => {
                reject(Errors.ErrorObject(err))
            }
        }))
    }

    headers() {
        return Utils.Merge(this.constructor.Headers, {
            token: App.GetToken()
        })
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