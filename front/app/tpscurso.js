class TpsCurso extends CursosDetalle {

    extraConfiguration() {
        return {
            components: {
                filter: {
                    width: 1000,
                    height: 100
                }
            }
        }
    }

    labelText() {
        return "Trabajos Prácticos por Curso y Materia"
    }

    filterItemsNew() {
        return [
            this.itemAñoLectivo(),
            this.itemCurso(),
            this.itemMateria()
        ]
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
                    this.itemCurso(),
                    this.itemMateriaCurso()
                ]
            }),
        ]
    }

    itemCurso() {
        return Item.Lookup({
            dataField: "curso",
            displayExpr: item => Cursos.Descripcion(item),
            editable: true,
            width: 400,
            onValueChanged: e => this.setMateriaCursoDataSource(e.value)
        })
    }

    itemMateriaCurso() {
        return Item.Lookup({
            dataField: "materiacurso",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            deferRendering: false,
            width: 250,
            label: "Materia",
            onValueChanged: e => this.setDataSource(e.value)
        })
    }

    setMateriaCursoDataSource(curso) {
        if (curso != undefined) {
            this.filter().setEditorDataSource("materiacurso",
                DsList({
                    path: "materias_cursos",
                    filter: { curso: curso.id },
                    onLoaded: this.filter().onLoadedSetFirstValue("materiacurso"),
                })
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    setDataSource(materiacurso) {
        if (materiacurso != undefined) {
            this.list().setDataSource(
                DsList({
                    path: "tps",
                    filter: { materiacurso: materiacurso.id }
                })
            )
        } else {
            this.list().setDataSource(null);
        }
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "periodonombre", caption: "Período" }),
            Column.Text({ dataField: "nombre" }),
            Column.Date({ dataField: "desde", width: 200 }),
            Column.Date({ dataField: "hasta", caption: "Fecha de Entrega", width: 200 })
        ]
    }

    formViewClass() {
        return TpsCursoForm;
    }

    formViewDefaultValues() {
        const curso = this.filter().getEditorValue("curso");
        return {
            curso: curso.id,
            añolectivo: curso.añolectivo,
            descripcion: Cursos.Descripcion(curso),
            desde: Dates.Today()
        }
    }

    materiacurso() {
        return this.filter().getEditorValue("materiacurso")
    }

    formViewParameters() {
        return { curso: this.curso() }
    }

    cursoOnValueChanged(e) {
        if (this.valueHasChanged(e)) {
            this.setMateriaDataSource(e.value);
        }
    }

    materiaOnValueChanged(e) {
        if (this.valueHasChanged(e)) {
            this.setDataSource(e.value ? e.value : undefined);
        }
    }

}

class TpsCursoForm extends FormView {

    defineRest() {
        return new Rest({ path: "tps", transformData: (verb, data) => this.transformData(verb, data) })
    }

    transformData(verb, data) {
        return {
            id: data.id,
            materiacurso: this.materiacurso().id,
            periodo: data.periodo.id,
            nombre: data.nombre,
            desde: data.desde,
            hasta: data.hasta
        }
    }

    popupExtraConfiguration() {
        return {
            title: "Trabajo Práctico",
            width: 750,
            height: 500
        }
    }

    formItems() {
        return [
            Item.Group({
                items: [
                    Item.Id(),
                    Item.Group({
                        colCount: 3,
                        items: [
                            Item.ReadOnly({ dataField: "añolectivo", label: "Año Lectivo" }),
                            Item.ReadOnly({ dataField: "descripcion", label: "Curso", colSpan: 2 }),
                        ]
                    }),
                    Item.Text({
                        dataField: "materiacurso",
                        readOnly: true,
                        value: this.materiacurso().materianombre,
                        width: 200,
                        label: "Materia"
                    }),
                    Item.Group({
                        items: [
                            Item.Text({
                                dataField: "nombre",
                                required: true,
                                placeholder: "Ingrese el Nombre del Trabajo Práctico"
                            }),
                        ]
                    }),
                    Item.Lookup({
                        dataField: "periodo",
                        dataSource: DsList({ path: "periodos" }),
                        displayExpr: "nombre",
                        required: true,
                        width: 250
                    }),
                    Item.Group({
                        colCount: 4,
                        items: [
                            Item.Date({
                                dataField: "desde",
                                required: true
                            }),
                            Item.Empty(),
                            Item.Date({
                                dataField: "hasta",
                                required: true,
                            })
                        ]
                    })
                ]
            }),
        ]
    }

    materiacurso() {
        return this.listView().materiacurso();
    }

    firstEditor() {
        return "nombre";
    }

}