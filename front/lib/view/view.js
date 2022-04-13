class View extends Component {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            mode: "view",
            popup: {
                contentTemplate: e => this.popupTemplate(e),
                onShown: e => this.popupOnShown(e),
                onHiding: e => this.popupOnHiding(e)
            }
        })
    }

    mode() {
        return this.configuration().mode;
    }

    isPopup() {
        return this.mode() == "popup";
    }

    render() {
        return this.initRender()
            .then(() =>
                this.renderView())
            .then(() =>
                this.afterRender())
            .then(() =>
                this.endRender())
            .catch(err =>
                this.handleError(err)
            );
    }

    initRender() {
        return new Promise((resolve, reject) => {
            resolve(this.beforeRender())
        })
    }

    beforeRender() {

    }

    renderView() {
        this.renderComponents();
        this.renderTemplate();
    }

    afterRender() {}

    endRender() {
        if (this.isPopup()) {
            return new Promise((resolve, reject) => {
                this.resolveRender = resolve;
            });
        }
    }

    renderComponents() {
        Object.keys(this.components()).forEach(
            key => this.components()[key].render()
        )
    }

    components() {
        if (this._components == undefined) {
            this._components = this.defineComponents();
        }
        return this._components;
    }

    defineComponents() {
        let components = {};
        let configurationComponents = this.configuration().components || {};
        Object.keys(configurationComponents).forEach(
            key => {
                let component = this.defineComponent(key, configurationComponents[key]);
                if (component != undefined) {
                    components[key] = component;
                }
            }
        )
        return components;
    }

    defineComponent(key, configuration) {
        if (configuration.element == undefined) {
            configuration.element = this.template().findElement(key);
        }
        if (configuration.element != undefined) {
            let componentClass = this.componentClass(key, configuration)
            if (componentClass != undefined) {
                configuration.view = this;
                return new(componentClass)(configuration);
            }
        }
    }

    componentClass(key, configuration) {
        let componentClass = configuration.componentClass;
        if (componentClass == undefined) {
            componentClass = this.componentsClasses().get(key);
        }
        return componentClass;
    }

    componentsClasses() {
        if (this._componentsClasses == undefined) {
            this._componentsClasses = this.defineComponentsClasses();
        }
        return this._componentsClasses;
    }

    defineComponentsClasses() {
        return new Map()
            .set("list", Grid)
            .set("grid", Grid)
            .set("toolbar", Toolbar)
            .set("contextMenu", ContextMenu)
            .set("form", Form)
            .set("button", Button)
            .set("label", Label)
            .set("treeItems", TreeItems)
            .set("filter", Form)
    }

    template() {
        if (this._template == undefined) {
            this._template = this.defineTemplate()
        }
        return this._template;
    }

    defineTemplate() {
        return this.parameters().template || this.templateDefault();
    }

    templateDefault() {
        return Templates.Empty()
    }

    renderTemplate() {
        if (this.isPopup()) {
            this.popup().show();
        } else {
            this.template().renderInto(this.element());
        }
    }

    popup() {
        if (this._popup == undefined) {
            this._popup = this.definePopup();
        }
        return this._popup;
    }

    definePopup() {
        return new Popup(this.configuration().popup);
    }

    view() {
        return this.configuration().view;
    }

    findElement(className) {
        return this.template().findElement(className);
    }

    popupTemplate(e) {

        e.parent().css("background-color", App.POPUP_BACKGROUND_COLOR);
        e.addClass("-vertical -padding-10")

        this.template().renderInto(e)

    }

    afterRender() {}

    focus() {}

    valueHasChanged(e) {
        return (e.previousValue == undefined || e.value == undefined || e.value.id != e.previousValue.id);
    }

    close() {
        if (this.isPopup()) {
            this.popup().close();
        } else {
            App.BlankViewElement()
        }
    }

    handleError(err) {
        err = this.errorToObject(err);
        if (err.code != Errors.FORM_VALIDATION) {
            return this.showError(err)
                .then(() => {
                    if (err.isValidation != true) {
                        this.closeData = { error: true }
                        this.close()
                    }
                })
        }
    }

    errorToObject(err) {
        if (err instanceof TypeError) {
            err = { message: err.message }
        }
        return err;
    }

    showError(parameters) {
        return App.ShowError(parameters);
    }

    closeData() {
        return {}
    }

    popupOnShown(e) {
        this.focus();
    }

    popupOnHiding(e) {
        this.resolveRender(this.closeData || {});
    }

}