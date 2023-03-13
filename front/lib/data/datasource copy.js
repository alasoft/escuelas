class DataSource extends ObjectBase {

    constructor(parameters) {
        super(parameters);
        this.keyName = this.parameters().keyName || App.KEY_NAME;
        this.loadMode = this.parameters().cache == true ? "raw" : "processed";
        this.description = this.parameters().description;
    }

    rest() {
        if (this._rest == undefined) {
            this._rest = this.defineRest()
        }
        return this._rest;
    }

    defineRest() {
        return new Rest({ path: this.parameters().path, })
    }

    configuration() {
        return {
            path: this.parameters().path,
            key: this.keyName,
            loadMode: this.loadMode,
            load: searchData => {
                return this.rest().promise({
                    verb: "list",
                    data: this.listData(searchData)
                }).then(data =>
                    this.transformData(data)
                )
            },
            byKey: this.parameters().cache == true ? undefined : key =>
                this.rest().promise({
                    verb: "get",
                    data: {
                        [this.keyName]: key
                    }
                }),
            onLoaded: data => {
                if (this.parameters().onLoaded != undefined) {
                    this.parameters().onLoaded(data)
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

        return Utils.Merge({ descripcion: descripcion() }, Utils.Evaluate(this.parameters().filter))

    }

    transformData(data) {
        if (this.parameters().transformData != undefined) {
            return this.parameters().transformData(data);
        } else {
            return data;
        }
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
            data: parameters.data
        }
    })
}