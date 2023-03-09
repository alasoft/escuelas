class TpsCurso extends CursosMateriasDetalle {

    extraConfiguration() {
        return {
            mode: "view",
            popup: {
                title: "Trabajos Prácticos por Curso y Materia",
                height: 600,
            },
            components: {
                filter: {
                    width: 400,
                    height: 150
                }
            }
        }
    }

    labelText() {
        return "Trabajos Prácticos por Curso y Materia"
    }

    itemAñoLectivo() {
        return super.itemAñoLectivo({ readOnly: false })
    }

    itemCurso() {
        return super.itemCurso({ deferRendering: false })
    }

    itemMateriaCurso() {
        return super.itemMateriaCurso({ deferRendering: false })
    }

    setDataSource(materiacurso) {
        if (materiacurso != undefined) {
            this.list().setDataSource(
                Ds({
                    path: "tps",
                    filter: { materiacurso: materiacurso }
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
            Column.Date({ dataField: "desde", width: 200, caption: "Fecha de Inicio", format: App.DATE_FORMAT_LONG }),
            Column.Date({ dataField: "hasta", caption: "Fecha de Entrega", width: 200, format: App.DATE_FORMAT_LONG })
        ]
    }

    formViewClass() {
        return TpsCursoForm;
    }

    deleteMessage() {
        return "<b>Borra el Trabajo Práctico ?<br><br>" + Html.Tab() +
            Strings.SingleQuotes(this.focusedRowValue("nombre")) +
            "<br><br>del Curso:<br><br>" + Html.Tab() + Strings.SingleQuotes(this.getFilterText("curso")) +
            "<br><br>de la Materia:<br><br>" + Html.Tab() + Strings.SingleQuotes(this.getFilterText("materiacurso"))
    }

    deleteErrorMessage(err) {
        return this.composeDeleteErrorMessasge({
            name: "esta Materia",
            description: this.focusedRowValue("nombre"),
            err: err,
            vinculo: "vinculada"
        })
    }

    restPath() {
        return "tps";
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setDataSource(e.value);
    }

    toolbarItems() {
        return [this.itemInsert(), this.itemTodos()]
    }

    itemTodos() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                text: "Todos los Trabajos Prácticos",
                icon: "folder",
                onClick: e => this.todos()
            }
        }
    }

    todos() {
        new Tps().render()
    }

}

class TpsCursoForm extends FormView {

    defineRest() {
        return new Rest({
            path: "tps",
            transformData: (verb, data) => this.transformData(verb, data)
        })
    }

    popupConfiguration() {
        return {
            title: () => "Trabajo Práctico de " + this.materiaNombre(),
            width: 750,
            height: 500
        }
    }

    transformData(verb, data) {
        return Utils.ReduceIds({
            id: data.id,
            materiacurso: this.materiaCurso(),
            periodo: data.periodo,
            nombre: data.nombre,
            desde: data.desde,
            hasta: data.hasta
        })
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
                            Item.ReadOnly({ dataField: "cursodescripcion", label: "Curso", colSpan: 2 }),
                        ]
                    }),
                    Item.Text({
                        dataField: "materianombre",
                        readOnly: true,
                        value: this.materiaNombre(),
                        width: 200,
                        label: "Materia"
                    }),
                    Item.Text({
                        dataField: "nombre",
                        required: true,
                        placeholder: "Ingrese el Nombre del Trabajo Práctico"
                    }),
                    Item.Lookup({
                        dataField: "periodo",
                        dataSource: Ds({ path: "periodos" }),
                        required: true,
                        width: 500,
                        displayExpr: item => Periodos.Descripcion(item),
                        onValueChanged: e => this.periodoOnValueChanged(e)
                    }),
                    Item.Group({
                        colCount: 2,
                        items: [
                            Item.DateLong({
                                dataField: "desde",
                                required: true,
                                label: "Fecha de Inicio",
                                format: App.DATE_FORMAT_LONG
                            }),
                            Item.DateLong({
                                dataField: "hasta",
                                required: true,
                                label: "Fecha de Entrega",
                                format: App.DATE_FORMAT_LONG
                            })
                        ]
                    }),
                ]
            }),
        ]
    }

    materiaCurso() {
        return this.listView().materiaCurso();
    }

    materiaNombre() {
        return this.listView().materiaNombre();
    }

    firstEditor() {
        return "nombre";
    }

    beforeRender() {
        return new Rest({ path: "periodos" }).promise({
                verb: "list",
                data: { añoLectivo: this.listView().añoLectivo().id }
            }).then(rows =>
                this.periodos = rows)
            .then(() =>
                Arrays.ToDate(this.periodos, ["desde", "hasta"]))
    }

    afterRender() {
        if (this.isInserting()) {
            if (this.periodoDefault() != undefined) {
                this.setEditorValue("periodo", this.periodoDefault().id);
                this.setEditorValue("desde", this.desdeDefault())
            }
        }
    }

    periodoDefault() {
        if (this._periodoDefault == undefined) {
            this._periodoDefault = this.definePeriodoDefault()
        }
        return this._periodoDefault;
    }

    desdeDefault() {
        if (this._desdeDefault == undefined) {
            this._desdeDefault = this.defineDesdeDefault()
        }
        return this._desdeDefault;
    }

    definePeriodoDefault() {
        let periodo;
        if (0 < this.periodos.length) {
            this.periodos.find(per =>
                Dates.Between(Dates.Today(), per.desde, per.hasta));
            if (periodo == undefined) {
                periodo = this.periodos[0];
            }
        }
        return periodo;
    }

    defineDesdeDefault() {
        let desde = Dates.Today;
        if (!Dates.Between(desde, this.periodoDefault().desde, this.periodoDefault().hasta)) {
            desde = this.periodoDefault().desde;
        }
        return desde;
    }

    periodoOnValueChanged(e) {
        if (this.getEditorValue("desde") != null) {
            this.blankEditorValue("desde");
        }
        if (this.getEditorValue("hasta") != null) {
            this.blankEditorValue("hasta");
        }
    }

}