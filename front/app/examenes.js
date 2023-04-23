class Examenes extends AñoLectivoFilterView {

    path() {
        return "examenes_all";
    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Examenes de todas las Materias",
                height: 650,
                width: 1300
            },
            components: {
                list: {
                    showBorders: true
                }
            }
        }
    }

    labelText() {
        return "Trabajos Prácticos";
    }

    listColumns() {
        return [
            Column.Id(),
            this.columnCurso(),
            Column.Text({ dataField: "materianombre", caption: "Materia Dictada", width: 180 }),
            Column.Date({ dataField: "desde", width: 180, caption: "Inicio", format: App.DATE_FORMAT_LONG }),
            Column.Date({ dataField: "hasta", caption: "Entrega", width: 180, format: App.DATE_FORMAT_LONG }),
            Column.Text({ dataField: "nombre", width: 250, caption: "Trabajo Práctico" }),
            Column.Text({ dataField: "periodonombre", caption: "Período", filtering: true, width: 200 }),
        ]
    }

    formViewClass() {
        return ExamenesForm;
    }

    excelFileName() {
        return "Trabajos Prácticos " + this.getFilterText("añolectivo");
    }

}

class ExamenesForm extends CursosMateriasForm {

    path() {
        return "examenes";
    }

    transformData(data) {
        return Utils.Merge(Utils.NormalizeData(data, "id,periodo,nombre,desde,hasta"), { materiacurso: this.materiaCurso() })
    }

    popupConfiguration() {
        return {
            title: () => "Trabajo Práctico",
            width: 750,
            height: 500
        }
    }

    formItems() {
        return [
            Item.Id(),
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
                    this.itemMateriaCurso(),
                    Item.Text({
                        dataField: "nombre",
                        required: true,
                        colSpan: 2,
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
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    Item.DateLong({
                        dataField: "desde",
                        required: true,
                        label: "Fecha de Inicio",
                    }),
                    Item.Date({
                        dataField: "hasta",
                        required: true,
                        label: "Fecha de Entrega",
                    }),
                ]
            }),

        ]
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
        super.afterRender();
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

}