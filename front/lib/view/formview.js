class FormView extends EntryView {

    listView() {
        return this.parameters().listView;
    }

    rest() {
        if (this._rest == undefined) {
            this._rest = this.defineRest();
        }
        return this._rest;
    }

    async init() {
        this.refreshTitle();
        if (this.id() != undefined) {
            await this.get(this.id());
        }
        this.focus();
    }

    get(id) {
        return this.rest().get({ id: id })
            .then(data =>
                this.updateData(data))
            .then(data =>
                this.saveData(data))
            .catch(err => {
                this.handleError(err, true)
            })
    }

    id() {
        return this.data().id;
    }

    isInserting() {
        return this.id() == undefined;
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

    originalTitle() {
        return this.configuration().popup.title;
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
        return this.rest().insert(this.dataToInsert())
            .then(data => {
                this.close(this.closeDataSaveInsert(data.id));
            });
    }

    saveUpdate() {
        return this.rest().update(this.dataToUpdate())
            .then(data =>
                this.close(this.closeDataSaveUpdate())
            );
    }

    dataToInsert() {
        return this.data();
    }

    dataToUpdate() {
        const data = this.changedData();
        data.id = this.id();
        return data;
    }

    close(closeData) {
        if (closeData.mustRefreshListView == true && this.listView() != undefined) {
            this.listView().refresh(closeData.id);
        }
        super.close(closeData);
    }

    popupOnShown(e) {
        this.init();
    }

    closeDataInsert(id) {
        return {
            okey: true,
            operation: this.operation(),
            id: id,
            mustRefreshListView: true
        };
    }

    closeDataUpdate() {
        return {
            okey: true,
            operation: this.operation(),
            id: this.id(),
            dataHasChanged: this.dataHasChanged(),
            mustRefreshListView: this.dataHasChanged()
        }
    }

    closeDataNotSaved() {
        return {
            okey: true,
            operation: this.operation(),
            id: this.id(),
            dataHasChanged: false,
            mustRefreshListView: false
        }
    }

    operation() {
        if (this.isInserting()) {
            return "insert";
        } else {
            return "update";
        }
    }

}