class MateriasCurso extends CursosDetalle {

    extraConfiguration() {
        return {
            mode: "view",
            popup: {
                title: "Materias dictadas en el Curso",
            },
            components: {
                filter: {
                    width: 280
                }
            }
        }
    }

    labelText() {
        return "Materias por Curso"
    }

    path() {
        return "materias_cursos";
    }

    itemAñoLectivo() {
        return super.itemAñoLectivo({ readOnly: false })
    }

    itemCurso() {
        return super.itemCurso({ deferRendering: false })
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "materianombre", caption: "Materia" })
        ]
    }

    toolbar() {
        return this.components().toolbar;
    }

    toolbarItems() {
        return [this.itemInsert()]
    }

    itemSpace() {
        return {
            text: "   ",
            location: "before"
        }
    }

    contextMenuItems() {
        return super.contextMenuItems().concat(this.contextMenuEvaluaciones())
    }

    contextMenuEvaluaciones() {
        return {
            text: "Evaluaciones",
            onClick: () => this.evaluaciones()
        }
    }

    itemEvaluaciones() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Evaluaciones",
                    //                    stylingMode: "contained",
                    icon: "edit",
                    onClick: e => this.evaluaciones()
                }
            }
        }
    }

    itemMateriasDias() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Dias y Horas agendados",
                    icon: "event",
                    onClick: e => this.materiasDias()
                }
            }
        }
    }

    itemTps() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Trabajos Prácticos",
                    icon: "file",
                    onClick: e => this.tps()
                }
            }
        }
    }

    tps() {
        new TpsCurso(this.detailData()).render();
    }

    materiasDias() {
        new MateriasDias(this.detailData()).render()
    }

    evaluaciones() {
        return new Evaluaciones({
            mode: "popup",
            popup: {
                title: "Evaluaciones",
                fullScreen: true
            }
        }).render();
    }

    detailData() {
        return {
            masterView: this,
            añolectivo: this.añoLectivo(),
            curso: this.curso(),
            materiacurso: this.id()
        }
    }

    formViewClass() {
        return MateriasCursoForm;
    }

    deleteMessage() {
        return this.composeDeleteMessage({ title: "esta Materia", description: this.focusedRowValue("materia") })
        return "<b>Borra esta Materia ?<br><br>" + Html.Tab() +
            Strings.SingleQuotes(this.focusedRowValue("materianombre")) +
            "<br><br>dictada en el Curso:<br><br>" + Html.Tab() + Strings.SingleQuotes(this.filterText("curso"))
    }

    listOnContentReady(e) {
        super.listOnContentReady(e);
        if (this.toolbar().isReady()) {
            this.toolbar().setItems(this.toolbarItems());
        }
    }

}

class MateriasCursoForm extends FormView {

    defineRest() {
        return new Rest({ path: "materias_cursos", transformData: (verb, data) => this.transformData(verb, data) })
    }

    transformData(verb, data) {
        return Utils.ReduceIds({
            id: data.id,
            curso: data.curso,
            materia: data.materia
        })
    }

    popupConfiguration() {
        return {
            title: "Materia del Curso",
            width: 600,
            height: 450
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.ReadOnly({ dataField: "añolectivo", width: 80, label: "Año Lectivo" }),
            Item.ReadOnly({ dataField: "cursodescripcion", label: "Curso" }),
            Item.Lookup({ dataField: "materia", dataSource: Materias.DataSource(), required: true, width: 250 }),
        ]
    }

    firstEditor() {
        return "materia";
    }

    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.curso().id);
        }
    }

}