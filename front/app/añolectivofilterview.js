class AñoLectivoFilterView extends FilterView {

    filterItems() {
        return [
            Item.Lookup({
                dataField: "añoLectivo",
                dataSource: AñosLectivos.DataSource(),
                width: 130,
                onValueChanged: e => this.setDataSource(e.value.id)
            }),
        ]
    }

    añoLectivo() {
        if (this.filter().instance() != undefined) {
            return this.filter().getEditorValue("añoLectivo");
        }
    }

    añoLectivoValue() {
        if (this.filter().instance() != undefined) {
            return this.filter().getEditorValue("añoLectivo").id;
        }
    }

    setDataSource(añoLectivo) {
        if (añoLectivo != undefined) {
            this.list().setDataSource(DsList({
                path: this.path(),
                filter: { añoLectivo: añoLectivo }
            }))
        } else {
            this.list().setDataSource(null);
        }
    }

    formViewDefaultValues(mode) {
        return { añoLectivo: this.añoLectivo().id }
    }

    afterRenderComponents() {
        super.afterRenderComponents();
        this.filter().setEditorValue("añoLectivo", AñosLectivos.Get(Dates.ThisYear()));
    }

}