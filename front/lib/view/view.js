class View extends Component {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            popup: {
                showCloseButton: true,
                contentTemplate: e => this.popupTemplate(e),
                onShown: e => this.popupOnShown(e),
                onHiding: e => this.popupOnHiding(e)
            }
        })
    }

    isPopup() {
        return this.configuration().mode == "popup";
    }

    isFullScreen() {
        return this.configuration().fullScreen == true;
    }

    render() {
        return this.initRender()
            .then(() =>
                this.beforeRender())
            .then(() =>
                this.renderComponents())
            .then(() =>
                this.renderTemplate())
            .then(() =>
                this.afterRender())
            .then(() =>
                this.endRender())
            .catch(err =>
                this.handleError(err))
    }

    initRender() {
        return Utils.EmptyPromise();
    }

    beforeRender() { }

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
        const components = {};
        const configurationComponents = this.configuration().components || {};
        Object.keys(configurationComponents).forEach(
            key => {
                const component = this.defineComponent(key, configurationComponents[key]);
                if (component != undefined) {
                    components[key] = component;
                }
            }
        )
        return components;
    }

    defineComponent(key, configuration) {
        const componentClass = this.componentClass(key, configuration)
        if (componentClass != undefined) {
            if (configuration.element == undefined) {
                configuration.element = this.template().findElementByClass(configuration.templateClass || key);
            }
            if (0 < configuration.element.length) {
                configuration.parentView = this;
                return new (componentClass)(configuration);
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
            .set("tree", TreeList)
            .set("filter", Form)
            .set("scheduler", Scheduler)
    }

    template() {
        if (this._template == undefined) {
            this._template = this.defineTemplate()
        }
        return this._template;
    }

    defineTemplate() {
        return new Template()
    }

    renderTemplate() {
        if (this.isPopup()) {
            this.popup().show();
        } else {
            this.template().appendTo(this.element());
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

    afterRender() {
        if (this.isFullScreen()) {
            App.HideItems();
        }
        return this.loadState()
    }

    loadState() {
        return Users.GetState({ module: this.className() })
            .then(state => {
                this.state = (Utils.IsDefined(state) ? JSON.parse(state) : this.emptyState());
            })
            .then(() =>
                this.setState())
            .then(() =>
                this.afterSetState())
    }

    emptyState() {
        return {}
    }

    setState() { }

    afterSetState() { }

    endRender() {
        if (this.isPopup()) {
            return new Promise((resolve, reject) => {
                this.resolveRender = resolve;
            });
        } else {
            return null;
        }
    }

    popupTemplate(e) {
        e.parent().css({
            "background-color": App.POPUP_BACKGROUND_COLOR,
            "padding-top": "5px"
        });
        e.css({
            "padding-top": "5px",
            "display": "flex",
            "flex-direction": "column"
        })
        this.template().appendTo(e)
    }

    parentView() {
        return this.configuration().parentView;
    }

    findElementByClass(className) {
        return this.template().findElementByClass(className);
    }

    focus() { }

    valueHasChanged(e) {
        return (e.previousValue == undefined || e.value == undefined || e.value.id != e.previousValue.id);
    }

    close(closeData) {
        if (this.isPopup()) {
            this._closeData = closeData;
            this.popup().close();
        } else {
            App.BlankViewElement()
        }
    }

    popupOnShown(e) {
        this.focus();
    }

    popupOnHiding(e) {
        this.resolveRender(this._closeData || this.closeDataDefault())
    }

    closeDataDefault() {
        return {}
    }

    handleError(err) {
        return Errors.Handle(err);
    }

    saveState() {
        return Users.SaveState({ module: this.className(), state: this.getState() })
    }

    getState() { }

}