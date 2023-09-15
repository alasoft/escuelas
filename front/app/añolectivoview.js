class AñoLectivoView extends FilterView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                filter: {
                    labelLocation: "left",
                    height: 50
                },
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
            readOnly: this.parameters().añoLectivoReadOnly == true,
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
            width: 350,
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

    getState() {
        return {
            añoLectivo: this.getFilterValue("añolectivo"),
            list: this.list().getState(),
        }
    }

    setState() {
        this.settingState = true;
        this.setFilterValue("añolectivo", this.state.añoLectivo || Dates.ThisYear());
        this.list().setState(this.state.list || null)
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setDataSource(e.value)
    }

    state() {
        return Utils.Merge(super.state(), {
            añoLectivo: this.filter().getValue("añolectivo")
        })
    }

}