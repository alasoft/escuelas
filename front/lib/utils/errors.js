class Errors {

    static INVALID_TOKEN = 1000;

    static FORM_VALIDATION = 2000;

    static Handle(err) {
        if (err.code == Exceptions.INVALID_TOKEN) {
            App.Login()
        } else if (err.type == Exceptions.TYPE_INTERNAL && err.side == Exceptions.SERVER_SIDE) {
            return App.ShowError({ message: this.ServerInternalErrorMessage(err) })
        } else {
            return App.ShowError({ message: err.message || App.UNIDENTIFIED_ERROR_MESSAGE })
        }
    }

    static ServerInternalErrorMessage(err) {
        return Messages.Sections([{ title: "Ha ocurrido un Error en el Servidor:", detail: err.message }, { title: "datos del error:", detail: err.detail }])
    }

    static HandleOld(err, afterShowError) {
        const errorObject = this.ErrorObject(err);
        if (errorObject.code == this.INVALID_TOKEN) {
            return App.Login();
        }
        if (errorObject.code == this.FORM_VALIDATION) {
            return;
        }
        return App.ShowError(errorObject)
            .then(afterShowError);
    }

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

}