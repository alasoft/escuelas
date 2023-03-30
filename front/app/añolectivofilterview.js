class AñoLectivoFilterView extends FilterView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                list: {
                    headerFilter: {
                        visible: true
                    },
                    filterPanel: {
                        visible: true,
                        labelLocation: "left"
                    }
                }
            }
        })
    }

    filterItems() {
        return [
            this.itemAñoLectivo(),
        ]
    }

    itemAñoLectivo() {
        return Item.Lookup({
            dataField: "añolectivo",
            dataSource: AñosLectivos.DataSource(),
            width: 130,
            label: "Año Lectivo",
            onValueChanged: e =>
                this.itemAñoLectivoOnValueChanged(e)
        })
    }

    añoLectivo() {
        if (this.filter().instance() != undefined) {
            return this.getFilterValue("añolectivo");
        }
    }

    columnCurso() {
        return Column.Calculated({
            dataField: "curso",
            formula: row => Cursos.Descripcion(row),
            caption: "Curso",
            name: "curso",
            width: 400,
            filterWidth: 600
        })
    }

    itemInsert() {
        if (this.añoLectivo() == Dates.ThisYear()) {
            return super.itemInsert();
        }
    }

    contextItemInsert() {
        if (this.añoLectivo() == Dates.ThisYear()) {
            return super.contextItemInsert();
        }
    }

    setDataSource(añolectivo) {
        if (añolectivo != undefined) {
            this.list().setDataSource(Ds({
                path: this.path(),
                filter: { añolectivo: añolectivo }
            }))
        } else {
            this.list().setDataSource(null);
        }
    }

    formViewDefaultValues(mode) {
        return { añolectivo: this.añoLectivo() }
    }

    setState() {
        super.setState();
        const añolectivo = (this.state.filter && this.state.filter.añolectivo) ? this.state.filter.añolectivo : Dates.ThisYear();
        this.setFilterValue("añolectivo", añolectivo)
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setDataSource(e.value)
    }

    state() {
        return Utils.Merge(super.state(), {
            filter: {
                añolectivo: this.filter().getValue("añolectivo")
            }
        })
    }

}