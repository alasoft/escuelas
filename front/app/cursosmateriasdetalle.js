class CursosMateriasDetalle extends CursosDetalle {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            popup: {
                width: 1000,
                onHidden: e => this.popupOnHidden(e)
            },
            components: {
                filter: {
                    width: 750
                }
            }
        })
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 6,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso(),
                    this.itemMateriaCurso()
                ]
            }),
        ]
    }

    itemCurso(p) {
        return super.itemCurso(Utils.Merge({ colSpan: 4 }, p))
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

    setMateriaCursoDataSource(curso) {
        if (curso != undefined) {
            this.filter().setEditorDataSource("materiacurso",
                Ds({
                    path: "materias_cursos",
                    filter: { curso: curso },
                    onLoaded: this.materiaCursoOnLoaded()
                }),
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    materiaCursoOnLoaded() {
        if (this.materiaCursoFirstValue == undefined) {
            return this.filter().onLoadedSetFirstValue("materiacurso");
        } else {
            this.materiaCursoFirstValue = undefined;
        }
    }

    filterAfterRenderData() {
        this.materiaCursoFirstValue = this.parameters().materiacurso;
        return Utils.Merge(super.filterAfterRenderData(), { materiacurso: this.materiaCursoFirstValue });
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

    closeDataDefault() {
        return { dataHasChanged: this.dataHasChanged, curso: this.curso(), materiaCurso: this.materiaCurso() }
    }

}