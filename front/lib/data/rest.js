class Rest {

    constructor(parameters) {
        this.path = parameters.path;
        this.transformData = parameters.transformData;
    }

    list(data) {
        return this.do("list", data);
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
        return this.promise({ verb: verb, data: data }).catch(err => {
            if (err.code == Errors.INVALID_TOKEN) {
                App.Login()
            } else {
                if (err instanceof TypeError) {
                    throw { message: err.message }
                } else {
                    throw err
                }
            }
        })
    }

    promise(parameters) {
        return new Promise((resolve, reject) => $.ajax({
            url: App.Url(this.path, parameters.verb),
            type: "POST",
            headers: Utils.Merge(Rest.Headers, { token: App.Token() }),
            data: this.dataToSend(parameters),
            success: data => resolve(data),
            error: err => reject(this.errorObject(err))
        }))
    }

    dataToSend(parameters) {
        if (parameters.data != undefined) {
            const dataToSend = (
                (this.transformData != undefined &&
                    Utils.StringIs(parameters.verb, ["insert", "update"]))
            ) ? this.transformData(parameters.verb, parameters.data) : parameters.data;
            return JSON.stringify(dataToSend);
        }
    }

    errorObject(error) {
        if (error.responseJSON != undefined) {
            return error.responseJSON;
        } else {
            return { message: "Ha ocurrido un error .. la operacion no pudo ser realizada" }
        }
    }

    static Headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

}