class Login extends EntryView {

    count = 0;
    maxAllowed = 3;

    restPath() {
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
            Tbi.WantToRegister({
                onClick: e => this.wantToRegister(e)
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
                this.close(this.closeDataOkey())
            )
            .catch(err =>
                this.handleError(err)
            );
    }

    login() {
        return this.rest().do("login", this.dataToSend())
    }

    dataToSend() {
        return Utils.ReduceObject(this.data(), ["email", "password"])
    }

    wantToRegister(e) {
        new Register().render();
    }

    showError(err) {
        return App.ShowError(err).then(() =>
            this.checkMaxAllowed())
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