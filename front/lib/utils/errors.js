class Errors {

    static INVALID_TOKEN = 1000;

    static FORM_VALIDATION = 2000;

    static ErrorObject(err) {
        if (Utils.IsObject(err)) {
            if (err.responseJSON != undefined) {
                return err.responseJSON;
            }
            if (err.responseText != undefined) {
                return {
                    message: err.responseText
                }
            }
            if (err.message == undefined) {
                return Utils.Merge(err, {
                    message: err.code == Errors.FORM_VALIDATION ? null : App.UNIDENTIFIED_ERROR_MESSAGE
                })
            }
            return { internal: true, message: err.message, stack: err.stack }
        } else {
            if (Utils.IsString(err)) {
                return { message: err }
            }
            return { internal: true, message: App.UNIDENTIFIED_ERROR_MESSAGE }
        }
    }

    static Handle(err) {
        if (err instanceof TypeError) {
            return App.ShowMessage([{ message: "Ha ocurrido un error inesperado:", detail: err.message }, { message: "Detalle:", detail: err.stack }])
        } else
        if (err.code == Exceptions.INVALID_TOKEN) {
            this.HandleInvalidToken()
        } else if (err.side == Exceptions.SERVER_SIDE && err.type == Exceptions.TYPE_INTERNAL) {
            this.HandleInternalServer(err)
        } else if (err.code == Exceptions.FORM_VALIDATION) {

        } else {
            return App.ShowError({ message: err.message || App.UNIDENTIFIED_ERROR_MESSAGE })
        }
    }

    static HandleInvalidToken() {
        App.ShowMessage(
            [{
                message: "La sesión del Usuario",
                detail: App.UserNombreApellido(),
                skipSection: 2
            }, {
                message: "ha terminado por tiempo",
                quotes: false,
                detail: "Para continuar operando Ud. debe reingresar al Sistema"
            }]
        ).then(closeData =>
            App.Login())
    }

    static HandleInternalServer(err) {
        return App.ShowError({
            message: Messages.Build([{
                message: "Ha ocurrido un Error en el Servidor:",
                detail: err.message
            }, {
                message: "datos del error:",
                detail: err.detail
            }])
        })
    }

}