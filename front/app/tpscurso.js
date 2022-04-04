class TpsCurso extends CursosDetalle {

    extraConfiguration() {
        return {
            popup: {
                height: 700
            },
            components: {
                filter: {
                    width: 1150,
                    height: 100
                }
            }
        }
    }

    labelText() {
        return "Trabajos Prácticos por Curso y Materia"
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

    itemMateriaCurso() {
        return Item.Lookup({
            dataField: "materiacurso",
            displayExpr: item =>
                item != null ? item.materianombre : "",
            deferRendering: false,
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
            Column.Text({ dataField: "periodonombre", caption: "Período", filtering: true }),
            Column.Text({ dataField: "nombre" }),
            Column.Date({ dataField: "desde", width: 200 }),
            Column.Date({ dataField: "hasta", caption: "Fecha de Entrega", width: 200 })
        ]
    }

    formViewClass() {
        return TpsCursoForm;
    }

    formViewDefaultValues(mode) {
        return Utils.Merge(super.formViewDefaultValues(mode),
            mode == "insert" ? {
                desde: Dates.Today(),
                hasta: Dates.TodayPlusDays(5)
            } : undefined)
    }

    materiacurso() {
        return this.filter().getEditorValue("materiacurso")
    }

    itemCursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setDataSource(e.value);
    }

    deleteMessage() {
        return "Borra el Trabajo Práctico ?<br><br>" +
            Utils.SingleQuotes(this.focusedRowValue("nombre")) +
            "<br><br>del Curso:<br><br>" + Utils.SingleQuotes(this.filterText("curso")) +
            "<br><br>Materia:<br><br>" + Utils.SingleQuotes(this.filterText("materiacurso"))
    }

}

class TpsCursoForm extends FormView {

    defineRest() {
        return new Rest({
            path: "tps",
            transformData: (verb, data) =>
                Utils.ReduceIds(this.transformData(verb, data))
        })
    }

    transformData(verb, data) {
        return {
            id: data.id,
            materiacurso: this.materiacurso(),
            periodo: data.periodo,
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
                        dataField: "materianombre",
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
                                label: "Fecha de Entrega"
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

    beforeRender() {
        return Rest.Promise({
            path: "periodos/list",
            data: { añoLectivo: this.listView().añolectivo().id }
        }).then(rows =>
            this.periodos = rows)
    }

    afterRender() {
        if (this.isInserting()) {
            this.setEditorValue("periodo", this.insertDefaultPeriodo())
        }
    }

    insertDefaultPeriodo() {
        if (this.periodos != undefined && 0 < this.periodos.length) {
            return { id: this.periodos[0].id }
        }
    }

}