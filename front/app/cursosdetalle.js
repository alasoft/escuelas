class CursosDetalle extends FilterView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            mode: "popup",
            popup: {
                title: this.labelText(),
                onHidden: e => {
                    if (this.configuration().masterView != undefined) {
                        this.configuration().masterView.list().focusRowById(this.curso().id);
                    }
                }
            },
            components: {
                filter: {
                    items: this.filterItems(),
                    width: 400
                }
            }
        })
    }

    añoLectivoReadOnly() {
        return true;
    }

    filterItems() {
        return [
            Item.Group({
                colCount: 2,
                items: [
                    this.itemAñoLectivo(),
                    this.itemCurso()
                ]
            })
        ]
    }

    itemAñoLectivo() {
        return Item.Lookup({
            dataField: "añolectivo",
            dataSource: AñosLectivos.DataSource(),
            width: 100,
            readOnly: this.añoLectivoReadOnly(),
            label: "Año Lectivo",
            onValueChanged: e => this.itemAñoLectivoOnValueChanged(e)
        })
    }

    itemCurso() {
        return Item.Lookup({
            dataField: "curso",
            displayExpr: item => Cursos.Descripcion(item),
            editable: true,
            width: 450,
            onValueChanged: e => this.itemCursoOnValueChanged(e)
        })
    }

    setCursoDataSource(añolectivo) {
        if (añolectivo != undefined) {
            this.filter().setEditorDataSource("curso",
                DsList({
                    path: "cursos",
                    filter: { añolectivo: añolectivo },
                })
            );
        } else {
            this.filter().setEditorDataSource("curso", null);
        }
    }

    setDataSource(curso) {
        if (curso != undefined) {
            this.list().setDataSource(
                DsList({
                    path: this.path(),
                    filter: { curso: curso.id }
                })
            )
        } else {
            this.list().setDataSource(null);
        }
    }

    afterRender() {
        super.afterRender();
        this.filter().setData({ añolectivo: this.configuration().añolectivo, curso: this.configuration().curso });
    }

    formViewDefaultValues(mode) {
        const curso = this.curso();
        return {
            curso: curso.id,
            añolectivo: curso.añolectivo,
            descripcion: Cursos.Descripcion(curso)
        }
    }

    añolectivo() {
        if (this.filter().instance() != undefined) {
            return this.filter().getEditorValue("añolectivo");
        }
    }

    curso() {
        return this.filter().getEditorValue("curso");
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setCursoDataSource(e.value.id);
    }

    itemCursoOnValueChanged(e) {
        this.setDataSource(e.value);
    }


}