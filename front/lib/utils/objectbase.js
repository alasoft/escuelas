class ObjectBase {

    constructor(parameters = {}) {
        this.parameters = parameters;
    }

    configuration() {
        if (this._configuration == undefined) {
            this._configuration = this.defineConfiguration();
        }
        return this._configuration;
    }

    defineConfiguration() {
        return Utils.Merge(this.defaultConfiguration(), this.extraConfiguration(), this.parameters);
    }

    defaultConfiguration() {}

    extraConfiguration() {}

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
            this._Instance = new(this.Class())();
        }
        return this._Instance;
    }

}