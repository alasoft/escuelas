class BaseMemoryTable extends BaseObject {

    static DataSource() {
        if (this._DataSource == undefined) {
            this._DataSource = this.DefineDataSource()
        }
        return this._DataSource;
    }

    static DefineDataSource() {
        return DsArray(this.Data())
    }

    static Get(id) {
        if (this.Data() != undefined) {
            return this.Data().find(item => item.id == id);
        }
    }

    static GetNombre(id) {
        let item = this.Get(id);
        return item ? item.nombre : "";
    }

}

class LocalMemoryTable extends BaseMemoryTable {

    static Data() {
        if (this._Data == undefined) {
            this._Data = this.DefineData()
        }
        return this._Data;
    }

}

class RestMemoryTable extends BaseMemoryTable {

    static Load() {
        return new Rest({ path: this.Path() }).list()
            .then(data =>
                this._Data = data);
    }

    static Path() {
        return this.ClassName().toLowerCase();
    }

    static Data() {
        return this._Data;
    }

}