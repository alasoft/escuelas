class Errors {

    static INVALID_TOKEN = 1000;

    static FORM_VALIDATION = 2000;

    static Handle(err, afterShowError) {
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
                return {
                    message: err.responseJSON.message
                }
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