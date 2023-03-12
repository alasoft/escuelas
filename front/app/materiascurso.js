class MateriasCurso extends CursosDetalle {

    extraConfiguration() {
        return {
            popup: {
                title: "Materias dictadas en el Curso",
            },
            components: {
                filter: {
                    width: 280
                },
                list: {
                    groupPanel: {
                        visible: false
                    }
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

    itemCurso() {
        return super.itemCurso({ deferRendering: false })
    }

    cursoLoadFirst() {
        return false;
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({
                dataField: "materianombre",
                caption: "Materia",
                width: 300,
            }),
            Column.Text({
                dataField: "horarios",
                template: (container, options) => {
                    $("<div>").html(options.value).appendTo(container)
                }
            })
        ]
    }

    toolbarItems() {
        return [this.itemInsert(), this.itemHorarios()];
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

    itemSpace() {
        return {
            text: " ".repeat(20)
        }
    }

    itemHorarios() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Horarios",
                    icon: "event",
                    onClick: e => this.horarios()
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

    horarios() {
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
            materiacurso: this.id(),
            mode: "popup"
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
            height: 400
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