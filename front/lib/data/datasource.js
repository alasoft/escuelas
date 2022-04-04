class DsBaseConfig {

    constructor(parameters) {
        this.parameters = parameters;
    }

    configuration() {
        return {
            key: "id",
            loadMode: this.parameters.cache == true ? "raw" : "processed"
        }
    }

    rest() {
        if (this._rest == undefined) {
            this._rest = new Rest(this.parameters);
        }
        return this._rest;
    }

}

class DsListConfig extends DsBaseConfig {

    configuration() {
        return Utils.Merge(super.configuration(), {
            load: searchData =>
                this.rest().list(this.loadData(searchData)),
            byKey: this.parameters.cache == true ? undefined : key =>
                this.rest().get({ id: key }),
            remove: key =>
                this.rest().delete({ id: key }),
            onLoaded: data =>
                this.parameters.onLoaded ? this.parameters.onLoaded(data) : undefined,
        })
    }

    loadData(searchData) {

        function searchExpr() {
            if (searchData != undefined && searchData.searchValue != undefined) {
                return searchData.searchValue;
            }
        }

        return Utils.Merge({ descripcion: searchExpr() }, this.parameters.filter);
    }

}

class DsRestConfig extends DsListConfig {

    configuration() {
        return Utils.Merge(super.configuration(), {
            insert: data => this.rest().insert(data),
            update: (key, data) => this.rest().update(Utils.Merge(data, { id: key })),
        })
    }

}

function DsList(parameters) {
    return new DevExpress.data.CustomStore(new DsListConfig(parameters).configuration());
}

function DsRest(parameters) {
    return new DevExpress.data.CustomStore(new DsRestConfig(parameters).configuration());
}

function DsArray(data) {
    return new DevExpress.data.DataSource({
        store: {
            type: "array",
            key: "id",
            data: data
        }
    })
}