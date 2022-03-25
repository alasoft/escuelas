class FormView extends EntryView {

    listView() {
        return this.configuration().listView;
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
                this.setData(data))
            .catch(err =>
                this.handleError(err))
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
                if (this.isInserting()) {
                    return this.saveInsert()
                } else {
                    return this.saveUpdate()
                }
            })
            .catch(err =>
                this.handleError(err)
            )
    }

    saveInsert() {
        return this.rest().insert(this.dataToInsert())
            .then(data =>
                this.close(data.id));
    }

    saveUpdate() {
        return this.rest().update(this.dataToUpdate())
            .then(data =>
                this.close(data.id));
    }

    dataToInsert() {
        return this.data();
    }

    dataToUpdate() {
        return this.data();
    }

    close(id) {
        if (id != undefined) {
            this.listView().refresh(id);
        }
        super.close(id);
    }

    popupOnShown(e) {
        this.init();
    }

}