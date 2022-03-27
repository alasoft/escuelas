class Component extends ObjectBase {

    configuration() {
        if (this._configuration == undefined) {
            this._configuration = this.defineConfiguration();
        }
        return this._configuration;
    }

    defineConfiguration() {
        return Utils.Merge(this.defaultConfiguration(), this.extraConfiguration(), this.parameters());
    }

    defaultConfiguration() {}

    extraConfiguration() {}

    element() {
        if (this._element == undefined) {
            this._element = this.defineElement();
        }
        return this._element;
    }

    defineElement() {
        return this.configuration().element || this.elementDefault();
    }

    elementDefault() {
        return App.ElementDefault();
    }

    static Render() {
        this.Instance().render();
    }

}