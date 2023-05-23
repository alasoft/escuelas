class CursosMaterias extends FilterViewBase {

    labelText(){
        return "Cursos y Materias"
    }

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
        return this.cursosMateriasData().refresh(this.añoLectivo())
            .then(() =>
                this.list().setColumns(this.columns()))
            .then(() =>
                this.list().setArrayDataSource(this.dataSource()))
            .catch(err =>
                this.handleError(err))
    }

    cursosMateriasData() {
        if (this._cursosMateriasData == undefined) {
            this._cursosMateriasData = new CursosMateriasData();
        }
        return this._cursosMateriasData;
    }

    columns() {
        return [
            {
                dataField: "id",
                visible: false
            },
            {
                dataField: "escuelanombre",
                caption: "Escuela"
            },
            {
                dataField: "cursoDescripcion",
                caption: "Curso"
            },
            {
                dataField: "materianombre",
                caption: "Materia"
            }
        ]
    }

    dataSource() {
        const data = this.cursosMateriasData();
        const cursosMateriasRows = data.cursosMateriasRows;
        const rows = [];
        for (const cursoMateriaRow of cursosMateriasRows) {
            rows.push(Object.assign({}, cursoMateriaRow))
        }
        return rows;
    }

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
                this.setFilterValue("añoLectivo", this.state.filter.añoLectivo || Dates.ThisYear()))
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