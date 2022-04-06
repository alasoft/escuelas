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
            //            deferRendering: false,
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
                    //                    onLoaded: this.filter().onLoadedSetFirstValue("materiacurso"),
                })
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    materiacurso() {
        return this.filter().getEditorValue("materiacurso")
    }

    itemCursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

    itemMateriaCursoOnValueChanged(e) {}

}