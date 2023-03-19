class CursosMateriasDetalle extends CursosDetalle {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            popup: {
                onHidden: e => this.popupOnHidden(e)
            }
        })
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 3,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso()
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    this.itemMateriaCurso()
                ]
            })
        ]
    }

    itemMateriaCurso(p) {
        return Item.Lookup(Utils.Merge({
            dataField: "materiacurso",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            width: 250,
            label: "Materia Dictada",
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        }, p))
    }

    setMateriaCursoDataSource(curso) {
        if (curso != undefined) {
            this.filter().setEditorDataSource("materiacurso",
                Ds({
                    path: "materias_cursos",
                    filter: { curso: curso },
                    onLoaded: this.filter().onLoadedSetFirstValue("materiacurso")
                }),
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    filterAfterRenderData() {
        return Utils.Merge(super.filterAfterRenderData(), { materiacurso: this.parameters().materiacurso });
    }

    materiaCurso() {
        return this.getFilterValue("materiacurso");
    }

    materiaNombre() {
        return this.getFilterText("materiacurso");
    }

    itemCursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

    itemMateriaCursoOnValueChanged(e) {}

    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.materiaCurso());
        }
    }

}