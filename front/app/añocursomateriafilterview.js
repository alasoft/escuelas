class AñoCursoMateriaFilterView extends FilterView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            fullScreen: true,
            components: {
                filter: { width: 1100 },
                list: {
                    showColumnLines: true
                }
            }
        })
    }

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
                    this.itemFilterCurso(), this.itemFilterMateriaCurso()
                ]
            })
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

    itemFilterCurso() {
        return Item.Lookup({
            dataField: "curso",
            label: "Filtra por Curso",
            clearButton: true,
            displayExpr: item =>
                Cursos.Descripcion(item),
            width: 400,
            onValueChanged: e =>
                this.itemCursoOnValueChanged(e)
        })
    }

    itemFilterMateriaCurso(p) {
        return Item.Lookup({
            dataField: "materiacurso",
            label: "Filtra por Materia",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            width: 250,
            clearButton: true,
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        })
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

    setDataSource() {
        if (this.añoLectivo() != undefined) {
            this.list().setDataSource(Ds({
                path: this.path(),
                filter: { añolectivo: this.añoLectivo(), curso: this.curso(), materiacurso: this.materiaCurso() }
            }))
        } else {
            this.list().setDataSource(null);
        }
    }

    setCursoDataSource() {
        if (this.añoLectivo() != undefined) {
            this.filter().setEditorDataSource("curso",
                Ds({
                    path: "cursos",
                    filter: { añolectivo: this.añoLectivo() },
                })
            );
        } else {
            this.filter().setEditorDataSource("curso", null);
        }
    }

    setMateriaCursoDataSource() {
        if (this.curso() != undefined) {
            this.filter().setEditorDataSource("materiacurso",
                Ds({
                    path: "materias_cursos",
                    filter: { curso: this.curso() },
                }),
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    itemInsert() {
        if (this.añoLectivo() == Dates.ThisYear()) {
            return super.itemInsert();
        }
    }

    afterRender() {
        super.afterRender();
        this.refreshFilterValue("añolectivo", Dates.ThisYear())
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setDataSource();
        this.setCursoDataSource();
    }

    itemCursoOnValueChanged(e) {
        this.setDataSource();
        this.setMateriaCursoDataSource();
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setDataSource();
    }

}