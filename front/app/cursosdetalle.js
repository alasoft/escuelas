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
                    labelLocation: "left",
                    height: 50,
                    width: 350
                },
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
                readOnly: this.parameters().añoLectivoReadOnly == true,
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
                readOnly: this.parameters().cursoReadOnly == true,
                deferRendering: false,
                width: 450,
                displayExpr: item =>
                    Cursos.Descripcion(item),
                onValueChanged: e =>
                    this.itemCursoOnValueChanged(e)
            }, p))
    }

    loadCursos() {
        if (this.añoLectivo() != undefined) {
            new Rest({ path: "cursos" })
                .promise({
                    verb: "list",
                    data: { añolectivo: this.añoLectivo() }
                }).then(rows =>
                    this.filter().setArrayDataSource(
                        "curso", rows, this.settingState == true ? this.state.curso : undefined)
                )
        } else {
            this.filter().clearEditorDataSource("curso");
        }
    }

    setDataSource() {
        if (this.curso()) {
            this.list().setDataSource(
                Ds({
                    path: this.path(),
                    filter: { curso: this.curso() }
                })
            )
        } else {
            this.list().setDataSource(null);
        }
    }

    setState() {
        this.settingState = true;
        this.setFilterValue("añolectivo", this.state.añoLectivo || Dates.ThisYear())
        super.setState();
    }

    clearSettingState() {
        if (this.settingState == true) {
            this.settingState = false;
        }
    }

    filterAfterRenderData() {
        return {
            añolectivo: this.parameters().añolectivo || Dates.ThisYear(),
            curso: this.parameters().curso
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
            return this.getFilterValue("añolectivo");
        }
    }

    curso() {
        return this.getFilterValue("curso");
    }

    cursoDescripcion(withAñoLectivo = true) {
        return this.getFilterText("curso") + (withAñoLectivo ? " / " + this.getFilterText("añolectivo") : "")
    }

    itemAñoLectivoOnValueChanged(e) {
        this.loadCursos();
    }

    itemCursoOnValueChanged(e) {
        this.setDataSource();
    }

    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.curso());
        }
    }

    focus() {
        if (this.parameters().cursoReadOnly == true) {
            this.list().focus()
        } else {
            this.filter().focusEditor("curso");
        }
    }

    closeDataDefault() {
        return Utils.Merge(super.closeDataDefault(), { curso: this.curso() })
    }

}