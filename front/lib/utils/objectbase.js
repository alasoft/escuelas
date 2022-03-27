class ObjectBase {

    constructor(...parameters) {
        this._parameters = Utils.Merge(...parameters);
    }

    afterConstruction() {}

    parameters() {
        return this._parameters;
    }

    class() {
        return this.constructor;
    }

    className() {
        return this.class().name;
    }

    static Class() {
        return this.prototype.constructor;
    }

    static ClassName() {
        return this.Class().name;
    }

    static Instance() {
        if (this._Instance == undefined) {
            App.AddSingletonClass(this.Class())
            this._Instance = new(this.Class())();
        }
        return this._Instance;
    }

    static BlankSingleton() {
        this.Class()._DataSource = undefined;
        if (this._Instance != undefined) {
            this._Instance = undefined;
        }
    }

}