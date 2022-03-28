class TpsCurso extends CursosDetalle {

    finalConfiguration() {
        return {
            popup: {
                title: this.labelText(),
                //width: 1050,
                //                height: 550
            },
            components: {
                filter: {
                    height: 100,
                    //                    width: 1100,
                }
            }
        }
    }

    labelText() {
        return "Trabajos Prácticos por Curso y Materia xx"
    }

    filterItems() {
        return [
            Item.Group({
                items: [
                    this.itemAñoLectivo(),
                ]
            }),
            Item.Group({
                colCount: 3,
                items: [
                    this.itemCurso(),
                    this.itemMateria()
                ]
            })
        ]
    }

    itemCurso() {
        return Item.Lookup({
            dataField: "curso",
            displayExpr: "descripcion",
            deferRendering: false,
            colSpan: 2,
            onValueChanged: e => this.cursoOnValueChanged(e)
        })
    }

    itemMateria() {
        return Item.Lookup({
            dataField: "materiaCurso",
            displayExpr: "materia.nombre",
            deferRendering: false,
            width: 250,
            label: "Materia",
            onValueChanged: e => this.materiaOnValueChanged(e)
        })
    }

    setMateriaDataSource(curso) {
        if (curso != undefined) {
            this.filter().setEditorDataSource("materiaCurso",
                DsList({
                    path: "materias_cursos",
                    parameters: { curso: curso },
                    //                    onLoaded: this.filter().onLoadedSetFirstValue("materiaCurso"),
                })
            );
        } else {
            this.filter().setEditorDataSource("curso", null);
        }
    }

    setDataSource(materiaCurso) {
        if (curso != undefined) {
            this.list().setDataSource(
                DsList({
                    path: "tps",
                    parameters: { materiaCurso: materiaCurso }
                })
            )
        } else {
            this.list().setDataSource(null);
        }
    }


    path() {
        return "tps";
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "periodo.nombre", caption: "Período" }),
            Column.Text({ dataField: "nombre" }),
            Column.Date({ dataField: "desde", width: 200 }),
            Column.Date({ dataField: "hasta", caption: "Fecha de Entrega", width: 200 })
        ]
    }

    formViewClass() {
        return TpsCursoForm;
    }

    formViewDefaultValues() {
        return {
            curso: this.curso(),
            periodo: null,
            materiaCurso: this.filter().getEditorValue("materiaCurso"),
            desde: Dates.Today()
        }
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
        return new Rest({ path: "tps" })
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
                            Item.ReadOnly({ dataField: "curso.añoLectivo", label: "Año Lectivo" }),
                            Item.ReadOnly({ dataField: "curso.descripcion", label: "Curso", colSpan: 2 }),
                        ]
                    }),
                    Item.Lookup({
                        dataField: "materiaCurso",
                        displayExpr: "materia.nombre",
                        dataSource: DsList({
                            path: "materias_cursos",
                            parameters: { curso: this.parameters().curso }
                        }),
                        required: true,
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
                        displayExpr: "descripcion",
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

    firstEditor() {
        return "nombre";
    }

}