class Widget extends Component {

    render() {
        this.element()[this.widgetName()](this.configuration());
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

    focus() {
        this.instance().focus();
    }

    beginUpdate() {
        //        this.instance().beginUpdate();
    }

    endUpdate() {
        //        this.instance().endUpdate();
    }

}