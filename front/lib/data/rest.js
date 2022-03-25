class Rest {

    constructor(parameters) {
        this.path = parameters.path;
    }

    list(data) {
        let list = this.do("list", data);
        return list;
    }

    get(data) {
        return this.do("get", data)
    }

    insert(data) {
        return this.do("insert", data);
    }

    update(data) {
        return this.do("update", data);
    }

    delete(data) {
        return this.do("delete", data);
    }

    do(verb, data) {
        return this.promise({ verb: verb, data: data })
            .catch(err => {
                if (err.code == Errors.INVALID_TOKEN) {
                    App.Login()
                } else {
                    throw err
                }
            })
    }

    promise(parameters) {
        return new Promise((resolve, reject) => $.ajax({
            url: App.Url(this.path, parameters.verb),
            type: "POST",
            headers: Utils.Merge(Rest.Headers, { token: App.Token() }),
            data: parameters.data ? JSON.stringify(parameters.data) : undefined,
            success: data => resolve(data),
            error: error => reject(this.errorMessage(error))
        }))
    }

    errorMessage(error) {
        if (error.responseJSON != undefined) {
            return error.responseJSON;
        } else {
            return { message: "La operación no pudo ser realizada .." }
        }
    }

    static Headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

}