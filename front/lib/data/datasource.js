class DataSource {

    constructor(parameters) {
        this.path = parameters.path;
        this.loadMode = parameters.cache == true ? "raw" : "processed";
        this.filter = parameters.filter;
        this.onLoaded = parameters.onLoaded
    }

    rest() {
        if (this._rest == undefined) {
            this._rest = this.defineRest()
        }
        return this._rest;
    }

    defineRest() {
        return new Rest({ path: this.path })
    }

    configuration() {
        return {
            path: this.path,
            key: App.KEY_NAME,
            loadMode: this.loadMode,
            load: searchData => {
                return this.rest().promise({
                        verb: "list",
                        data: this.listData(searchData)
                    })
                    .then(rows => {
                        this.rows = rows
                        return this.rows
                    })
                    .catch(err =>
                        Errors.Handle(err).then(closeData => { throw err })
                    )
            },
            byKey: this.cache == true ? undefined : key =>
                this.rest().promise({
                    verb: "get",
                    data: {
                        [App.KEY_NAME]: key
                    }
                }),
            onLoaded: rows => {
                if (this.onLoaded != undefined) {
                    this.onLoaded(rows)
                }
            }
        }
    }

    listData(searchData) {

        function descripcion() {
            if (searchData != undefined && searchData.searchValue != undefined) {
                return searchData.searchValue;
            }
        }

        return Utils.Merge({ descripcion: descripcion() }, Utils.Evaluate(this.filter))

    }

}

function Ds(parameters) {
    return new DevExpress.data.CustomStore(new DataSource(parameters).configuration())
}

function DsArray(parameters) {
    return new DevExpress.data.DataSource({
        store: {
            type: "array",
            key: App.KEY_NAME,
            data: parameters.rows
        }
    })
}