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
            readOnly: this.parameters().materiaCursoReadOnly == true,
            deferRendering: false,
            width: 250,
            label: "Materia",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            onValueChanged: e =>
                this.itemMateriaCursoOnValueChanged(e)
        }, p))
    }

    loadMateriasCursos() {
        if (this.curso() != undefined) {
            new Rest({ path: "materias_cursos" })
                .promise({
                    verb: "list",
                    data: { curso: this.curso() }
                }).then(rows => {
                    this.filter().setArrayDataSource(
                        "materiacurso", rows, this.settingState == true ? this.state.materiaCurso : undefined);
                }).then(() =>
                    this.clearSettingState())
        } else {
            this.filter().clearEditorDataSource("materiacurso");
            this.clearSettingState()
        }
    }

    getState() {
        return Utils.Merge({
            añoLectivo: this.getFilterValue("añolectivo"),
        },
            this.parameters().isDetail != true ? {
                curso: this.getFilterValue("curso"),
                materiaCurso: this.getFilterValue("materiacurso"),
                list: this.list().getState(),
            } : undefined)
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
        this.loadMateriasCursos(e.value);
    }

    itemMateriaCursoOnValueChanged(e) { }

    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.materiaCurso());
        }
    }

    closeDataDefault() {
        return { dataHasChanged: this.dataHasChanged, curso: this.curso(), materiaCurso: this.materiaCurso() }
    }

}