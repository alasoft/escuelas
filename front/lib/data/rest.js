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
        return this.promise(verb, data).catch(err => {
            if (err.code == Errors.INVALID_TOKEN) {
                App.Login()
            } else {
                throw err
            }
        })
    }

    promise(verb, data) {
        return new Promise((resolve, reject) => $.ajax({
            url: App.Url(this.path, verb),
            type: "POST",
            headers: this.headersWithToken(),
            data: this.dataToSend(verb, data),
            success: data => resolve(data),
            error: error => reject(this.errorMessage(error))
        }))
    }

    headersWithToken() {
        return Utils.Merge(Rest.Headers, { token: App.Token() })
    }

    dataToSend(verb, data) {
        if (data != undefined) {
            if (this.parameters.transformData != undefined) {
                return JSON.stringify(this.parameters.transformData(verb, data));
            }
        }
    }

    transformData(verb, data) {
        if (this.parameters.transformData) {
            return this.parameters.transformData(verb, data)
        }
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