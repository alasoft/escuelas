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
                    Item.RecoverPassword()
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
        new RegisterView().render();
    }

    handleError(err) {
        if (err.code == Exceptions.INVALID_EMAIL_PASSWORD) {
            ++this.count;
            App.ShowErrorSections([{
                message: "La combinación de Email y Password, no corresponde a ningún Usuario registrado",
                detail: (this.count < this.maxAllowed ? "Por favor vuelva ingresar sus datos" : undefined),
                tab: false,
                quotes: false
            }]).then(closeData => this.count == this.maxAllowed ? this.closeAboveMaxAllowed() : undefined)
        } else {
            super.handleError(err)
        }
    }

    checkMaxAllowed() {
        if (++this.count == this.maxAllowed) {
            this.close(this.closeDataAboveMaxAllowed());
        }
    }

    closeAboveMaxAllowed() {
        this.close({ okey: false, aboveMaxAllowed: true });
    }

}