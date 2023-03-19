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
                this.close(this.closeDataOkey()))
            .catch(err =>
                this.handleError(err))
    }

    validate() {
        return new Promise((resolve, reject) => {
            this.formValidate().then(() => {
                if (this.email() != this.repeatEmail()) {
                    reject(Exceptions.Validation({ message: "<i>El Email ingresado no coincide con su repetición." }))
                }
                if (this.password().length < 8) {
                    reject(Exceptions.Validation({ message: "<i>El password ingresado debe tener al menos 8 caracteres." }))
                }
                if (this.password() != this.repeatPassword()) {
                    reject(Exceptions.Validation({ message: "<i>El password ingresado no coincide con su repeticion." + Messages.PorFavorVerifique(3) }))
                }
                resolve(true)
            }).catch(err =>
                reject(err)
            )
        })
    }

    handleError(err) {
        if (err.code == Exceptions.APELLIDO_NOMBRE_DUPLICATED) {
            this.handleApellidoNombreDuplicado(err)
        } else
        if (err.code == Exceptions.EMAIL_DUPLICATED) {
            this.handleEmailDuplicado(err)
        } else {
            super.handleError(err);
        }
    }

    handleApellidoNombreDuplicado(err) {
        App.ShowMessage([{
            message: "Ya existe un Usuario con Apellido y Nombre",
            detail: Strings.Concatenate([this.apellido(), this.nombre()], ", ")
        }])
    }

    handleEmailDuplicado(err) {
        App.ShowMessage([{
                message: "Ya existe un Usuario con el correo:",
                detail: this.email()
            },
            {
                message: "por favor ingrese otra dirección de correo electrónico"
            }
        ])
    }

    apellido() {
        return this.getData().apellido;
    }

    nombre() {
        return this.getData().nombre;
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
        return App.ShowMessage({ message: "La registración ha sido exitosa" })
    }

}