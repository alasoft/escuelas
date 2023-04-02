class LoginView extends EntryView {

    count = 0;
    maxAllowed = 3;

    constructor(parameters) {
        super(parameters);
    }

    path() {
        return "users";
    }

    popupConfiguration() {
        return {
            title: App.Title("Ingreso de Usuario"),
            width: 600,
            height: 350,
        }
    }

    formItems() {
        return [
            Item.Group({
                items: [
                    Item.Email({ required: true })
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    Item.Password(),
                    Item.RecoverPassword({ visible: false })
                ]
            }),
            Item.Group({
                items: [
                    Item.ToglePassword({
                        form: () => this.form()
                    })
                ]
            })

        ]
    }

    toolbarItems() {
        return super.toolbarItems().concat([
            ToolbarItem.WantToRegister({
                onClick: e => this.register(e)
            })
        ])
    }

    okey() {
        this.validate()
            .then(() =>
                this.login())
            .then(user =>
                App.SetUser(user))
            .then(() =>
                this.close(this.closeDataOkey()))
            .catch(err =>
                this.handleError(err)
            );
    }

    login() {
        return this.rest().promise({
            verb: "login",
            data: this.dataToSend()
        });
    }

    dataToSend() {
        return Utils.ReduceObject(this.getData(), ["email", "password"])
    }

    register(e) {
        new RegisterView().render()
            .then(closeData =>
                this.form().clearData())
            .then(() =>
                this.form().focus());
    }

    handleError(err) {
        if (err.code == Exceptions.USER_EMAIL_NOT_FOUND) {
            this.handleUserEmailNotFound(err)
        } else if (err.code == Exceptions.USER_INVALID_PASSWORD) {
            this.handleInvalidPassword(err)
        } else {
            super.handleError(err)
        }
    }

    handleUserEmailNotFound(err) {
        ++this.count;
        App.ShowMessage({
                message: "<i>" + Messages.EMAIL_INGRESADO_NO_CORRESPONDE,
                lineFeed: 3,
                tab: 0,
                quotes: false,
                detail: Messages.POR_FAVOR_REGISTRESE
            })
            .then(closeData =>
                this.count == this.maxAllowed ? this.closeAboveMaxAllowed() : undefined)
    }

    handleInvalidPassword(err) {
        ++this.count;
        App.ShowMessage({
                message: "<i>" + Messages.COMBINACION_EMAIL_PASSWORD_INCORRECTA,
                detail: Messages.POR_FAVOR_VERIFIQUE,
                lineFeed: 3,
                tab: 0,
                quotes: false
            })
            .then(closeData =>
                this.count == this.maxAllowed ? this.closeAboveMaxAllowed() : undefined)
    }

    checkMaxAllowed() {
        if (++this.count == this.maxAllowed) {
            this.close(this.closeDataAboveMaxAllowed());
        }
    }

    closeAboveMaxAllowed() {
        this.close({ okey: false, aboveMaxAllowed: true });
    }

    loadState() {

    }

}