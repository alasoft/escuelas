class AñoLectivoFilterView extends FilterView {

    filterItems() {
        return [
            Item.Lookup({
                dataField: "añolectivo",
                dataSource: AñosLectivos.DataSource(),
                width: 130,
                label: "Año Lectivo",
                onValueChanged: e => this.setDataSource(e.value.id)
            }),
        ]
    }

    añolectivo() {
        if (this.filter().instance() != undefined) {
            return this.filter().getEditorValue("añolectivo");
        }
    }

    añolectivoValue() {
        if (this.filter().instance() != undefined) {
            return this.filter().getEditorValue("añolectivo").id;
        }
    }

    setDataSource(añolectivo) {
        if (añolectivo != undefined) {
            this.list().setDataSource(DsList({
                path: this.path(),
                filter: { añolectivo: añolectivo }
            }))
        } else {
            this.list().setDataSource(null);
        }
    }

    formViewDefaultValues(mode) {
        return { añolectivo: this.añolectivo().id }
    }

    afterRender() {
        super.afterRender();
        this.filter().setEditorValue("añolectivo", AñosLectivos.Get(Dates.ThisYear()));
    }

}