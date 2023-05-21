class CursosMaterias extends FilterViewBase {

    filterItems() {
        return [this.itemAñoLectivo()]
    }

    itemAñoLectivo() {
        return Item.Lookup({
            dataField: "añoLectivo",
            dataSource: AñosLectivos.DataSource(),
            width: 100,
            label: "Año Lectivo",
            onValueChanged: e =>
                this.itemAñoLectivoOnValueChanged(e)
        })
    }

    añoLectivo() {
        return this.getFilterValue("añoLectivo");
    }

    refresh() {
        return new Rest({ path: "cursos_materias" })
            .promise({
                verb: "list",
                data: { añolectivo: this.añoLectivo() }
            })
            .then(rows =>
                this.rows = rows)
    }

    refresh() { }

    getState() {
        return {
            filter: {
                añoLectivo: this.getFilterValue("añoLectivo"),
            },
            list: this.list().getState()
        }
    }

    setState() {
        this.settingState = true;
        Promise.resolve(this.list().setState(this.state.list))
            .then(() =>
                this.setFilterValue("añoLectivo", filter.añoLectivo || Dates.ThisYear()))
            .then(() =>
                this.refresh())
            .then(() =>
                this.settingState = false)
    }

    itemAñoLectivoOnValueChanged(e) {
        if (this.settingState != true) {
            this.refresh();
        }
    }

}