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
        return new EntryViewTemplate();
    }

    form() {
        return this.components().form;
    }

    formItems() {};

    getData() {
        return this.form().getData();
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

    getChangedData() {
        return this.form().getChangedData();
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
        return new Rest({ path: this.path() })
    }

    path() {
        throw new NotImplementedException({ message: "not implemented method: path()" })
    }

    transformData(data) {
        return data;
    }

    onFormEditorEnterKey(e) {
        this.okey();
    }

    validationError(message) {
        return { isValidation: true, message: message }
    }

    setEditorValue(dataField, value) {
        this.form().setEditorValue(dataField, value);
    }

    setEditorProperty(dataField, propertyName, value) {
        this.form().setEditorProperty(dataField, propertyName, value);
    }

    blankEditorValue(dataField) {
        this.form().blankEditorValue(dataField);
    }

    getEditorValue(dataField) {
        return this.form().getEditorValue(dataField);
    }

    getDate(dataField) {
        return this.form().getDate(dataField);
    }

    getValue(dataField) {
        return this.form().getValue(dataField);
    }

    getSingleQuotes(dataField) {
        return this.form().getSingleQuotes(dataField)
    }

    getEditorText(dataField) {
        return this.form().getEditorText(dataField);
    }

}

class EntryViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.form(),
                this.toolbar()
            ]
        }
    }

    form() {
        return {
            name: "form",
            margin: 10,
            fillContainer: true,
            orientation: "vertical"
        }
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }

}