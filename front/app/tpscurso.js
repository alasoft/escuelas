class TpsCurso extends CursosMateriasDetalle {

    path() {
        return "tps"
    }

    extraConfiguration() {
        return {
            mode: "view",
            popup: {
                title: "Evaluaciones por Curso y Materia",
                height: 600,
                width: 1050
            },
            components: {
                filter: {
                    width: 750,
                },
                list: {
                    showBorders: true
                }
            }
        }
    }

    itemCurso() {
        return super.itemCurso({ deferRendering: this.parameters().materiacurso != undefined })
    }

    labelText() {
        return "Evaluaciones por Curso y Materia"
    }

    setDataSource(materiacurso) {
        if (materiacurso != undefined) {
            this.list().setDataSource(
                Ds({
                    path: this.path(),
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
        return Messages.Build([{
            message: "Borra el Trabajo Práctico ?",
            detail: this.focusedRowValue("nombre")
        }, {
            message: "de la Materia",
            detail: this.getFilterText("materiacurso")
        }, {
            message: "del Curso",
            detail: this.cursoDescripcion()
        }])
    }

    deleteErrorMessage(err) {
        return this.composeDeleteErrorMessasge({
            name: "esta Materia",
            description: this.focusedRowValue("nombre"),
            err: err,
            vinculo: "vinculada"
        })
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setDataSource(e.value);
    }

    toolbarItems() {
        return [this.itemInsert(), this.itemTodos(), this.itemExportExcel()]
    }

    excelFileName() {
        return "Trabajos Prácticos " + this.cursoDescripcion() + " / " + this.getFilterText("materiacurso");
    }

    exportExcelDialogWidth() {
        return 800;
    }

    itemTodos() {
        if (this.configuration().showTodosButton != false) {
            return {
                widget: "dxButton",
                location: "before",
                visible: false,
                options: {
                    text: "Todos los Trabajos Prácticos",
                    icon: "folder",
                    onClick: e => this.todos()
                }
            }
        }
    }

    todos() {
        new Tps().render()
    }

}

class TpsCursoForm extends FormView {

    transformData(data) {
        return Utils.Merge(Utils.NormalizeData(data, "id,periodo,nombre,desde,hasta"), { materiacurso: this.materiaCurso() })
    }

    popupConfiguration() {
        return {
            title: () => "Trabajo Práctico de " + this.materiaNombre(),
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

    duplicatedMessage() {
        return Messages.Build([{
            message: "Ya existe un Trabajo Práctico con el nombre:",
            detail: this.getEditorValue("nombre")
        }, {
            message: "para la Materia",
            detail: this.getEditorValue("nombre")
        }, {
            message: "para el Curso",
            detail: this.cursoDescripcion()
        }])
    }

    cursoDescripcion() {
        return this.getEditorValue("cursodescripcion") + " / " + this.getEditorValue("añolectivo");
    }

    handleError(err) {
        if (err.code == Exceptions.DEBE_ESTAR_DENTRO_PERIODO) {
            this.handleDebeEstarDentroPeriodo(err)
        } else if (err.code == Exceptions.FECHA_INICIO_DEBE_SER_MENOR_FECHA_ENTREGA) {
            this.handleInicioDebeSerMenorEntrega(err)
        } else {
            super.handleError(err);
        }
    }

    handleDebeEstarDentroPeriodo(err) {
        App.ShowMessage([{
            message: "Las fechas",
            detail: this.form().getDate("desde") + " / " + this.form().getDate("hasta"),
            quotes: false,
        }, {
            message: "deben estar dentro del Periodo",
            detail: this.getEditorText("periodo"),
            quotes: false
        }])
    }

    handleInicioDebeSerMenorEntrega(err) {
        App.ShowMessage([{
            message: "La fecha de inicio",
            detail: this.getDate("desde"),
        }, {
            message: "debe ser menor a la de Entrega",
            detail: this.getDate("hasta")
        }])
    }

}