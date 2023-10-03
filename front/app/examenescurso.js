class ExamenesCurso extends CursosMateriasDetalle {

    path() {
        return "examenes"
    }

    extraConfiguration() {
        return {
            mode: "view",
            showTodosButton: false,
            popup: {
                title: "Examenes por Curso y Materia",
                height: 600,
                width: 1150
            },
            components: {
                filter: {
                    width: 750,
                    height: 70,
                    labelLocation: "top",
                },
                list: {
                    showBorders: true,
                    headerFilter: {
                        visible: true
                    },
                    filterPanel: {
                        visible: true,
                    },
                    pager: {
                        visible: false
                    },
                    paging: {
                        pageSize: 50
                    }
                }
            }
        }
    }

    itemCurso() {
        return super.itemCurso({ deferRendering: this.parameters().materiacurso != undefined, colSpan: 4 })
    }

    itemInsert() {
        if (this.getFilterValue("materiacurso") != undefined) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "add",
                    hint: "Agrega",
                    onClick: e => this.insert()
                }
            }
        }
    }

    toolbarItems() {
        return [this.itemInsert(), this.itemTodos()]
    }


    labelText() {
        return "Examenes por Curso y Materia"
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

    setState() {
        if (this.parameters().isDetail == true) {
            this.state.añoLectivo = this.parameters().añoLectivo;
            this.state.curso = this.parameters().curso;
            this.state.materiaCurso = this.parameters().materiaCurso;
        }
        super.setState()
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "periodonombre", caption: "Período", filtering: true, width: 220 }),
            Column.Calculated({ caption: "Tipo", formula: row => ExamenesTipos.GetNombre(row.tipo), width: 180 }),
            Column.Text({ dataField: "nombre" }),
            Column.Date({ dataField: "desde", width: 200, caption: "Fecha de Inicio", format: App.DATE_FORMAT_LONG }),
            Column.Date({ dataField: "hasta", caption: "Fecha de Cierre", width: 200, format: App.DATE_FORMAT_LONG })
        ]
    }

    formViewClass() {
        return ExamenesCursoForm;
    }

    deleteMessage() {
        return Messages.Build([{
            message: "Borra el Examen ?",
            detail: this.focusedRowValue("nombre")
        }, {
            message: "de la Materia",
            detail: this.getFilterText("materiacurso")
        }, {
            message: "del Curso",
            detail: this.cursoDescripcion()
        }])
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setDataSource(e.value);
    }

    excelFileName() {
        return "Examenes del Curso: " + this.cursoDescripcion() + " / " + this.getFilterText("materiacurso");
    }

    excelExportDialogWidth() {
        return 800;
    }

    itemTodos() {
        if (this.configuration().showTodosButton == true) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Todos los Examenes",
                    icon: "doc",
                    onClick: e => this.todos()
                }
            }
        }
    }

    todos() {
        new Examenes().render()
    }

}

class ExamenesCursoForm extends FormView {

    transformData(data) {
        return Utils.Merge(Utils.NormalizeData(data, "id,periodo,tipo,nombre,desde,hasta"), { materiacurso: this.materiaCurso() })
    }

    popupConfiguration() {
        return {
            title: () => "Examen de " + this.materiaNombre(),
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
                    Item.Lookup({
                        dataField: "tipo",
                        dataSource: ExamenesTipos.DataSource(),
                        required: true,
                        width: 150,
                        onValueChanged: e => this.examenesTiposOnValueChanged(e)
                    }),
                    Item.Text({
                        dataField: "nombre",
                        required: true,
                        placeholder: "Ingrese el Nombre de la Examen"
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
                                format: App.DATE_FORMAT_LONG,
                                onValueChanged: e => this.desdeOnValueChanged(e)
                            }),
                            Item.DateLong({
                                dataField: "hasta",
                                required: true,
                                label: "Fecha de Cierre",
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
        return "tipo";
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
            periodo = this.periodos.find(per =>
                Dates.Between(Dates.Today(), per.desde, per.hasta));
            if (periodo == undefined) {
                periodo = this.periodos[0];
            }
        }
        return periodo;
    }

    defineDesdeDefault() {
        let desde = Dates.Today();
        if (!Dates.Between(desde, this.periodoDefault().desde, this.periodoDefault().hasta)) {
            desde = this.periodoDefault().desde;
        }
        return desde;
    }

    examenesTiposOnValueChanged(e) {
        const examenTipo = ExamenesTipos.Get(e.value);
        this.setEditorProperty("hasta", "readOnly", examenTipo != undefined && examenTipo.fechaHasta == false)
        if (examenTipo != undefined && examenTipo.fechaHasta == false) {
            this.setEditorValue("hasta", this.getEditorValue("desde"))
        }
    }

    periodoOnValueChanged(e) {
        if (this.getEditorValue("desde") != null) {
            this.blankEditorValue("desde");
        }
        if (this.getEditorValue("hasta") != null) {
            this.blankEditorValue("hasta");
        }
    }

    desdeOnValueChanged(e) {
        const examenTipo = ExamenesTipos.Get(this.getEditorValue("tipo"));
        if (examenTipo != undefined && examenTipo.fechaHasta == false) {
            this.setEditorValue("hasta", this.getEditorValue("desde"))
        }
    }

    duplicatedMessage() {
        return Messages.Build([{
            message: "Ya existe una Examen con el nombre:",
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
        } else if (err.code == Exceptions.FECHA_ENTREGA_DEBER_SER_MAYOR_IGUAL_INICIO) {
            this.handleEntragaDebeSerMayorIgualInicio(err)
        } else {
            super.handleError(err);
        }
    }

    handleDebeEstarDentroPeriodo(err) {
        App.ShowMessage([{
            message: "El intervalo que va",
            detail: "del " + this.form().getDate("desde") + " al " + this.form().getDate("hasta"),
            quotes: false,
        }, {
            message: "debe estar dentro del Periodo",
            detail: this.getEditorText("periodo"),
            quotes: false
        }])
    }

    handleEntragaDebeSerMayorIgualInicio(err) {
        App.ShowMessage([{
            message: "La fecha de inicio",
            detail: this.getDate("desde"),
        }, {
            message: "debe ser menor o igual a la de Cierre",
            detail: this.getDate("hasta")
        }])
    }

}