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
        return this.form().data();
    }

    setData(data) {
        this.form().setData(data);
    }

    updateData(data) {
        this.form().updateData(data);
    }

    saveData() {
        this.form().saveData()
    }

    dataHasChanged() {
        return this.form().dataHasChanged()
    }

    changedData() {
        return this.form().changedData();
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
                super.okey())
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

    closeDataOkey() {
        return { okey: true, dataHasChanged: this.dataHasChanged() }
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

    validationError(message) {
        return { isValidation: true, message: message }
    }

    setEditorValue(dataField, value) {
        this.form().setEditorValue(dataField, value);
    }


}