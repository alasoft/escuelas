class CursosBaseView extends View {

    defaultConfiguration() {
        return {
            components: {
                filter: {
                    items: this.filterItems(),
                    labelLocation: "top"
                }
            }
        }
    }

    filterItems() {}

    itemAñoLectivo(p) {
        return Item.Lookup(Utils.Merge({
            dataField: "añolectivo",
            dataSource: AñosLectivos.DataSource(),
            width: 100,
            label: "Año Lectivo",
            onValueChanged: e =>
                this.itemAñoLectivoOnValueChanged(e)
        }, p))
    }

    itemCurso(p) {
        return Item.Lookup(
            Utils.Merge({
                dataField: "curso",
                deferRendering: false,
                width: 450,
                displayExpr: item =>
                    Cursos.Descripcion(item),
                onValueChanged: e =>
                    this.itemCursoOnValueChanged(e)
            }, p))
    }

    itemMateriaCurso(p) {
        return Item.Lookup(Utils.Merge({
            dataField: "materiacurso",
            deferRendering: false,
            width: 250,
            label: "Materia",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        }, p))
    }

    filter() {
        return this.components().filter;
    }

    añoLectivo() {
        return this.getFilterValue("añolectivo");
    }

    curso() {
        return this.getFilterValue("curso")
    }

    materiaCurso() {
        return this.getFilterValue("materiacurso")
    }

    getFilterValue(dataField) {
        return this.filter().getValue(dataField);
    }

    getFilterText(dataField) {
        return this.filter().getEditorText(dataField);
    }

    refreshFilterValue(dataField, value) {
        this.filter().refreshEditorValue(dataField, value)
    }

    loadCursos() {
        if (this.añoLectivo() != undefined) {
            return new Rest({ path: "cursos" })
                .promise({
                    verb: "list",
                    data: { añolectivo: this.añoLectivo() }
                }).then(rows =>
                    this.filter().setArrayDataSource("curso", rows))
        } else {
            return Promise.resolve(this.filter().clearEditorDataSource("curso"));
        }
    }

    loadMateriasCursos() {
        if (this.curso() != undefined) {
            return new Rest({ path: "materias_cursos" })
                .promise({
                    verb: "list",
                    data: { curso: this.curso() }
                }).then(rows => {
                    this.filter().setArrayDataSource("materiacurso", rows);
                })
        } else {
            return Promise.resolve(this.filter().clearEditorDataSource("materiacurso"));
        }
    }

    itemAñoLectivoOnValueChanged(e) {}

    itemCursoOnValueChanged(e) {}

    itemMateriaCursoOnValueChanged(e) {}

}