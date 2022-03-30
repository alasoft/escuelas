class EntryView extends DialogView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                form: {
                    items: this.formItems(),
                    onEditorEnterKey: e => this.onFormEditorEnterKey(e)
                }
            }
        })
    }

    defineTemplate() {
        return Templates.EntryView();
    }

    form() {
        return this.components().form;
    }

    formItems() {};

    data() {
        return this.form().getData();
    }

    setData(data) {
        this.form().setData(data);
    }

    updateData(data) {
        this.form().updateData(data);
    }

    firstEditor() {}

    focus() {
        this.focusFirstEditor();
    }

    focusFirstEditor() {
        let firstEditor = this.firstEditor()
        if (firstEditor != undefined) {
            this.form().focusEditor(firstEditor);
        } else {
            this.form().focus();
        }
    }

    okey() {
        this.validate()
            .then(() =>
                this.close(true))
            .catch(err => {
                this.handleError(err)
            })
    }

    validate() {
        return this.formValidate();
    }

    formValidate() {
        return this.form().validate();
    }

    handleError(err) {
        if (err.code != Errors.FORM_VALIDATION) {
            return this.showError(err)
                .then(() => {
                    if (err.isValidation != true) {
                        this.close(false)
                    }
                })
        }
    }

    showError(err) {
        return App.ShowError(err)
    }

    cancel() {
        this.close(false);
    }

    rest() {
        if (this._rest == undefined) {
            this._rest = this.defineRest()
        }
        return this._rest;
    }

    defineRest() {
        return new Rest({
            path: this.restPath()
        })
    }

    onFormEditorEnterKey(e) {
        this.okey()
    }

}