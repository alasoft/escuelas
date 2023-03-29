class Widget extends Component {

    render() {
        if (this.instance() == undefined) {
            this.element()[this.widgetName()](this.configuration());
        }
        return this;
    }

    instance() {
        try {
            return this.element()[this.widgetName()]("instance");
        } catch (e) {
            return undefined;
        }
    }

    getProperty(propertyName) {
        return this.instance().option(propertyName);
    }

    setProperty(propertyName, value) {
        this.instance().option(propertyName, value);
    }

    setProperties(properties) {
        this.instance().option(properties);
    }

    focus() {
        this.instance().focus();
    }

    beginUpdate() {
        this.instance().beginUpdate();
    }

    endUpdate() {
        this.instance().endUpdate();
    }

    isReady() {
        return this.instance() != undefined
    }

    getWidth() {
        return this.getProperty("width")
    }

    setWidth(width) {
        this.setProperty("width", width)
    }

}