class FormView extends EntryView {

    path() {
        return this.listView().path()
    }

    transformData(data, verb) {
        return Utils.NormalizeData(data);
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            sendAllData: true
        })
    }

    listView() {
        return this.parameters().listView;
    }

    async init() {
        this.refreshTitle();
        if (this.id() != undefined) {
            await this.get(this.id());
        }
        this.focus();
    }

    refreshTitle() {
        this.popup().setTitle(this.title())
    }

    title() {
        if (this.isInserting()) {
            return "Agrega " + this.originalTitle()
        } else {
            return "Modifica " + this.originalTitle()
        }
    }

    isInserting() {
        return this.id() == undefined;
    }

    id() {
        return this.getData().id;
    }

    get(id) {
        return this.rest().get({ id: id })
            .then(data =>
                this.afterGetData(data))
            .then(data =>
                this.updateData(data))
            .then(() =>
                this.saveData())
            .catch(err => {
                this.handleError(err)
            })
    }

    afterGetData(data) {
        return data;
    }

    okey() {
        this.validate()
            .then(() => {
                if (this.mustSave()) {
                    if (this.isInserting()) {
                        return this.saveInsert()
                    } else {
                        return this.saveUpdate()
                    }
                } else {
                    this.close(this.closeDataNotSaved());
                }
            })
            .catch(err =>
                this.handleError(err)
            )
    }

    mustSave() {
        return this.isInserting() || this.dataHasChanged();
    }

    saveInsert() {
        return this.rest().insert(this.dataToInsert(), "insert")
            .then(data => {
                this.close(this.closeDataSaveInsert(data.id));
            });
    }

    saveUpdate() {
        return this.rest().update(this.dataToUpdate(), "update")
            .then(data =>
                this.close(this.closeDataSaveUpdate())
            );
    }

    dataToInsert() {
        const data = this.getData();
        return this.transformData(data, "insert")
    }

    dataToUpdate() {
        let data;
        if (this.configuration().sendAllData == true) {
            data = this.getData();
        } else {
            data = Utils.Merge(this.getChangedData(), { id: this.id() });
        }
        return this.transformData(data, "update")
    }

    closeDataSaveInsert(id) {
        return {
            okey: true,
            operation: this.operation(),
            id: id,
            dataHasChanged: true,
        };
    }

    closeDataSaveUpdate() {
        const dataHasChanged = this.dataHasChanged();
        return {
            okey: true,
            operation: this.operation(),
            id: this.id(),
            dataHasChanged: dataHasChanged,
        }
    }

    closeDataNotSaved() {
        return {
            okey: true,
            operation: this.operation(),
            id: this.id(),
            dataHasChanged: false,
        }
    }

    close(closeData) {
        if (closeData.dataHasChanged == true && this.listView() != undefined) {
            this.listView().refresh(closeData.id);
        }
        super.close(closeData);
    }

    popupOnShown(e) {
        this.init();
    }

    operation() {
        if (this.isInserting()) {
            return "insert";
        } else {
            return "update";
        }
    }

    handleError(err) {
        if (err.code == Exceptions.REQUIRED_VALUE) {
            App.ShowMessage({ message: "Ha ocurrido un error en el Servidor:", detail: "Campo requerido " + Strings.SingleQuotes(err.message), quotes: false })
        } else
        if (err.code == Exceptions.DUPLICATED_ENTITY) {
            App.ShowError({ message: this.duplicatedMessage() })
        } else {
            super.handleError(err)
        }
    }

    duplicatedMessage() {
        return "Registro duplicado"
    }

}