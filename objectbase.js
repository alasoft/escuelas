class ObjectBase {

    static Class() {
        return this.prototype.constructor;
    }

    static ClassName() {
        return this.Class().name;
    }

    static Instance() {
        if (this._Instance == undefined) {
            this._Instance = new(this.Class())()
        }
        return this._Instance;
    }

}

module.exports.ObjectBase = ObjectBase