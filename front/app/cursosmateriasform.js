class CursosMateriasForm extends FormView {

    añoLectivo() {
        return this.listView().añoLectivo();
    }

    materiaCurso() {
        return this.getEditorValue("materiacurso");
    }

    itemAñoLectivo() {
        return Item.ReadOnly({
            dataField: "añolectivo",
            width: 100
        })
    }

    itemCurso() {
        return Item.Lookup({
            dataField: "curso",
            dataSource: Ds({ path: "cursos", filter: { añoLectivo: this.añoLectivo() } }),
            displayExpr: item => Cursos.Descripcion(item),
            width: 400,
            colSpan: 2,
            required: true,
            onValueChanged: e => this.cursoOnValueChanged(e)
        })
    }

    itemMateriaCurso() {
        return Item.Lookup({
            dataField: "materiacurso",
            displayExpr: item => item != null ? item.materianombre : "",
            deferRendering: false,
            width: 250,
            label: "Materia",
            colSpan: 2,
            required: true,
            onValueChanged: e => this.materiaCursoOnValueChanged(e)
        })
    }

    afterGetData(data) {
        this.firstMateriaCurso = data.materiacurso;
        return data;
    }

    firstEditor() {
        return "curso";
    }

    setMateriaCursoDataSource(curso) {
        if (curso != undefined) {
            this.form().setEditorDataSource("materiacurso",
                Ds({
                    path: "materias_cursos",
                    filter: { curso: curso },
                    onLoaded: data => {
                        if (this.firstMateriaCurso != undefined) {
                            this.setFirstMateriaCurso()
                        }
                    }
                }),
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    setFirstMateriaCurso() {
        this.setEditorValue("materiacurso", this.firstMateriaCurso);
        this.firstMateriaCurso = undefined;
    }

    cursoDescripcion() {
        return this.getEditorText("curso") + " / " + this.getEditorValue("añolectivo");
    }

    cursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

    materiaCursoOnValueChanged(e) {}

}