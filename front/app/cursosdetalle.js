class CursosDetalle extends FilterView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            mode: "popup",
            popup: {
                title: this.popupTitle(),
                onHidden: e => this.popupOnHidden(e)
            },
            components: {
                filter: {
                    width: 350
                }
            }
        })
    }

    popupTitle() {
        this.labelText();
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

    itemAñoLectivo(p) {
        return Item.Lookup(
            Utils.Merge({
                dataField: "añolectivo",
                dataSource: AñosLectivos.DataSource(),
                readOnly: true,
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
                displayExpr: item =>
                    Cursos.Descripcion(item),
                width: 400,
                onValueChanged: e =>
                    this.itemCursoOnValueChanged(e)
            }, p))
    }

    setCursoDataSource(añolectivo) {
        if (añolectivo != undefined) {
            this.filter().setEditorDataSource("curso",
                Ds({
                    path: "cursos",
                    filter: { añolectivo: añolectivo },
                    onLoaded: this.filter().onLoadedSetFirstValue("curso")
                })
            );
        } else {
            this.filter().setEditorDataSource("curso", null);
        }
    }

    setDataSource(curso) {
        if (curso != undefined) {
            this.list().setDataSource(
                Ds({
                    path: this.path(),
                    filter: { curso: curso }
                })
            )
        } else {
            this.list().setDataSource(null);
        }
    }

    afterRender() {
        super.afterRender();
        this.filter().setData(this.filterAfterRenderData());
    }

    filterAfterRenderData() {
        return {
            añolectivo: this.parameters.añolectivo || Dates.ThisYear(),
            curso: this.parameters.curso
        }
    }

    formViewDefaultValues(mode) {
        const curso = this.curso();
        return {
            añolectivo: this.añoLectivo(),
            curso: this.curso(),
            cursodescripcion: this.getFilterText("curso")
        }
    }

    añoLectivo() {
        if (this.filter().instance() != undefined) {
            return this.filter().getEditorValue("añolectivo");
        }
    }

    curso() {
        return this.filter().getEditorValue("curso");
    }

    itemAñoLectivoOnValueChanged(e) {
        this.setCursoDataSource(e.value);
    }

    itemCursoOnValueChanged(e) {
        this.setDataSource(e.value);
    }

    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.curso());
        }
    }

}