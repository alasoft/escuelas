class Form extends Widget {

    constructor(parameters) {
        super(parameters);
    }

    widgetName() {
        return "dxForm";
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            formData: {},
            labelLocation: "left",
            colCount: 1,
        })
    }

    getData() {
        return this.getProperty("formData");
    }

    getValue(dataField) {
        return this.getData()[dataField];
    }

    setData(data) {
        this.setProperty("formData", data);
    }

    clearData() {
        this.setData(null)
    }

    updateData(data) {
        this.instance().updateData(data);
        return data;
    }

    getItems() {
        return this.getProperty("items");
    }

    setItems(items) {
        this.setProperty("items", items);
    }

    getEditor(dataField) {
        return this.instance().getEditor(dataField);
    }

    getDate(dataField) {
        return Dates.Format(this.getEditorValue(dataField))
    }

    getSingleQuotes(dataField) {
        return Strings.SingleQuotes(this.getEditorValue(dataField))
    }

    getEditorProperty(dataField, propertyName) {
        return this.getEditor(dataField).option(propertyName);
    }

    getEditorValue(dataField) {
        return this.getEditorProperty(dataField, "value")
    }

    getEditorText(dataField) {
        return this.getEditorProperty(dataField, "text")
    }

    getEditorSelectedItem(dataField) {
        return this.getEditorProperty(dataField, "selectedItem");
    }

    getEditorSelectedValue(dataField, name) {
        const selectedItem = this.getEditorProperty(dataField, "selectedItem");
        if (selectedItem != undefined) {
            return selectedItem[name];
        }
    }

    setEditorProperty(dataField, propertyName, value) {
        this.getEditor(dataField).option(propertyName, value);
    }

    setEditorProperties(dataField, properties) {
        this.getEditor(dataField).option(properties);
    }

    setEditorValue(dataField, value) {
        this.setEditorProperty(dataField, "value", value)
    }

    refreshEditorValue(dataField, value) {
        this.setEditorValue(dataField, undefined);
        this.setEditorValue(dataField, value);
    }

    blankEditorValue(dataField) {
        this.setEditorProperties(dataField, {
            value: null,
            isValid: true
        })
    }

    setEditorDataSource(dataField, dataSource) {
        this.blankEditorValue(dataField)
        this.setEditorProperty(dataField, "dataSource", dataSource)
    }

    setArrayDataSource(dataField, rows) {
        this.setEditorDataSource(dataField, DsArray({ rows: rows }));
        if (rows != undefined && 0 < rows.length) {
            this.setEditorValue(dataField, rows[0].id)
        }
    }

    clearEditorDataSource(dataField) {
        this.setEditorDataSource(dataField, null);
    }

    focusEditor(dataField) {
        this.getEditor(dataField).focus();
    }

    saveData() {
        this._dataSaved = Utils.Clone(this.getData());
    }

    dataHasChanged() {

        function equals(value, valueSaved) {
            const x = Utils.IsObject(value) ? value.id : value;
            const xSaved = Utils.IsObject(valueSaved) ? valueSaved.id : valueSaved;
            return x == xSaved;
        }

        if (this._dataSaved == undefined) {
            return true;
        } else {
            const data = this.getData();
            return Object.keys(data).find(
                key => !equals(data[key], this._dataSaved[key])
            ) != undefined;
        }

    }

    getChangedData() {
        const data = Utils.ReduceIds(Utils.Clone(this.getData()));
        const dataSaved = Utils.ReduceIds(this._dataSaved);
        var updated = {};
        Object.keys(data).forEach(
            key => data[key] != this._dataSaved[key] ? updated[key] = data[key] : undefined
        )
        return updated;
    }

    toglePassword(dataField) {
        this.setEditorProperty(dataField, "mode",
            this.getEditorProperty(dataField, "mode") == "password" ? "text" : "password")
    }

    toglePasswords(dataFields) {
        dataFields.forEach(
            dataField => this.toglePassword(dataField)
        )
    }

    validate() {
        return new Promise(async(resolve, reject) => {
            let validate = this.instance().validate();
            if (validate.status == "pending") {
                validate = await validate.complete;
            }
            if (validate.isValid) {
                resolve(true)
            } else {
                reject(Exceptions.FormValidation())
            }
        })
    }

    onLoadedSetFirstValue(dataField) {
        return data =>
            data.length > 0 ? this.setEditorValue(dataField, data[0].id) : undefined;
    }

}