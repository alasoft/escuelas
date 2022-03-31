class Register extends EntryView {

    extraConfiguration() {
        return {
            popup: {
                title: App.Title("Nuevo Usuario"),
                width: 700,
                height: 500
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

    restPath() {
        return "users";
    }

    okey() {
        this.validate()
            .then(() =>
                this.register())
            .then(() =>
                this.close(true))
            .then(() =>
                this.exitMessage())
            .catch(err =>
                this.handleError(err))
    }

    validate() {
        return new Promise((resolve, reject) => {
            this.formValidate().then(() => {
                if (this.email() != this.repeatEmail()) {
                    reject(this.validationError("Los emails deben coincidir"))
                }
                if (this.password().length < 8) {
                    reject(this.validationError("El password debe tener al menos 8 caracteres"))
                }
                if (this.password() != this.repeatPassword()) {
                    reject(this.validationError("Los passwords deben coincidir"))
                }
                resolve(true)
            }).catch(err =>
                reject(err)
            )
        })
    }

    email() {
        return this.data().email;
    }

    repeatEmail() {
        return this.data().repeatEmail;
    }

    password() {
        return this.data().password;
    }

    repeatPassword() {
        return this.data().repeatPassword;
    }

    register() {
        return this.rest().promise({
            verb: "register",
            data: this.dataToSend()
        })
    }

    dataToSend() {
        return Utils.ReduceObject(this.data(), ["apellido", "nombre", "email", "password"]);
    }

    exitMessage() {
        App.ShowMessage({ message: "La registración ha sido exitosa" })
    }

}