class RegisterView extends EntryView {

    constructor(parameters) {
        super(parameters);
    }

    path() {
        return "users";
    }

    extraConfiguration() {
        return {
            popup: {
                title: App.Title("Nuevo Usuario"),
                width: 700,
            }
        }
    }

    formItems() {
        return [
            Item.Nombre(),
            Item.Apellido(),
            Item.Email(),
            Item.RepeatEmail(),
            Item.Password(),
            Item.RepeatPassword(),
            Item.ToglePassword({
                onClick: e => this.form().toglePasswords(["password", "repeatPassword"])
            })
        ]
    }

    okey() {
        this.validate()
            .then(() =>
                this.register())
            .then(() =>
                this.exitMessage())
            .then(() =>
                this.close(true))
            .catch(err =>
                this.handleError(err))
    }

    validate() {
        return new Promise((resolve, reject) => {
            this.formValidate().then(() => {
                if (this.email() != this.repeatEmail()) {
                    reject(Exceptions.Validation({ message: "Los emails deben coincidir" }))
                }
                if (this.password().length < 8) {
                    reject(Exceptions.Validation({ message: "El password debe tener al menos 8 caracteres" }))
                }
                if (this.password() != this.repeatPassword()) {
                    reject(Exceptions.Validation({ message: "El password debe coincidir con su repetición" }))
                }
                resolve(true)
            }).catch(err =>
                reject(err)
            )
        })
    }

    handleError(err) {
        if (err.code == Exceptions.EMAIL_DUPLICATED) {
            App.ShowErrorSections([{
                message: "Ya existe un Usuario con el correo:",
                detail: this.email()
            }, { message: "por favor ingrese otra dirección de correo electrónico" }])
        } else {
            super.handleError(err);
        }
    }

    email() {
        return this.getData().email;
    }

    repeatEmail() {
        return this.getData().repeatEmail;
    }

    password() {
        return this.getData().password;
    }

    repeatPassword() {
        return this.getData().repeatPassword;
    }

    register() {
        return this.rest().promise({
            verb: "register",
            data: this.dataToSend()
        })
    }

    dataToSend() {
        return Utils.ReduceObject(this.getData(), ["apellido", "nombre", "email", "password"]);
    }

    exitMessage() {
        App.ShowMessage({ message: "La registración ha sido exitosa" })
    }

}