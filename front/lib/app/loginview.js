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
                    Item.Email()
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
        Errors.Handle(err, () => this.checkMaxAllowed())
    }

    checkMaxAllowed() {
        if (++this.count == this.maxAllowed) {
            this.close(this.closeDataAboveMaxAllowed());
        }
    }

    closeDataAboveMaxAllowed() {
        return { okey: false, aboveMaxAllowed: true };
    }

}