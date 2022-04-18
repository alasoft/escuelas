class CursosDetalle extends FilterView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            mode: "popup",
            popup: {
                title: this.labelText(),
                onHidden: e => {
                    if (this.masterView() != undefined) {
                        this.masterView().focusRowById(this.curso().id);
                    }
                }
            },
            components: {
                filter: {
                    width: 400
                }
            }
        })
    }

    masterView() {
        return this.parameters().masterView;
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
            deferRendering: this.itemCursoDeferRendering(),
            editable: true,
            width: this.itemCursoWidth(),
            colSpan: this.itemCursoColSpan(),
            onValueChanged: e => this.itemCursoOnValueChanged(e)
        })
    }

    itemCursoWidth() {
        return 450
    }

    itemCursoColSpan() {
        return 1;
    }

    itemCursoDeferRendering() {
        return true;
    }

    setCursoDataSource(añolectivo) {
        if (añolectivo != undefined) {
            this.filter().setEditorDataSource("curso",
                DsList({
                    path: "cursos",
                    filter: { añolectivo: añolectivo },
                    onLoaded: this.filter().onLoadedSetFirstValue("curso"),
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
        this.filter().setData(this.dataAterRender());
    }

    dataAterRender() {
        return { añolectivo: this.parameters().añolectivo, curso: this.parameters().curso }
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
        return this.filterValue("curso");
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setCursoDataSource(e.value.id);
    }

    itemCursoOnValueChanged(e) {
        this.setDataSource(e.value);
    }

    popupOnHiding(e) {
        this.resolveRender({ curso: this.curso() });
    }

}