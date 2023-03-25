class BaseMemoryTable extends ObjectBase {

    static DataSource() {
        if (this._DataSource == undefined) {
            this._DataSource = this.DefineDataSource()
        }
        return this._DataSource;
    }

    static DefineDataSource() {
        return DsArray({ rows: this.Data() })
    }

    static Get(data) {
        if (this.Data() != undefined) {
            return this.Data().find(item => item.id == Utils.ReduceId(data));
        }
    }

    static GetNombre(id) {
        const item = this.Get(id);
        return item ? item.nombre : "";
    }

    static GetId(nombre) {
        const item = this.Data().find(item => item.nombre == nombre);
        return item ? item.id : undefined;
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