class CursosMateriasDetalle extends CursosDetalle {

    filterItems() {
        return [
            Item.Group({
                colCount: 2,
                items: [
                    this.itemAñoLectivo(),
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    this.itemCurso(),
                    this.itemMateriaCurso()
                ]
            }),
        ]
    }

    itemMateriaCurso() {
        return Item.Lookup({
            dataField: "materiacurso",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            deferRendering: this.parameters().materiacurso != undefined,
            width: 250,
            label: "Materia",
            onValueChanged: e => this.itemMateriaCursoOnValueChanged(e)
        })
    }

    setMateriaCursoDataSource(curso) {
        if (curso != undefined) {
            this.filter().setEditorDataSource("materiacurso",
                DsList({
                    path: "materias_cursos",
                    filter: { curso: curso.id },
                    onLoaded: this.parameters().materiacurso == undefined ? this.filter().onLoadedSetFirstValue("materiacurso") : undefined,
                })
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    dataAterRender() {
        return { añolectivo: this.parameters().añolectivo, curso: this.parameters().curso, materiacurso: this.parameters().materiacurso }
    }

    materiacurso() {
        return this.filter().getEditorValue("materiacurso")
    }

    itemCursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

    itemMateriaCursoOnValueChanged(e) {}

}