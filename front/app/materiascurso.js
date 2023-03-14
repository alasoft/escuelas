class MateriasCurso extends CursosDetalle {

    path() {
        return "materias_cursos";
    }

    extraConfiguration() {
        return {
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
        return Messages.Sections([{ title: "Borra la Materia ?", detail: this.focusedRowValue("materianombre") }, {
            title: "dictada en el Curso",
            detail: this.getFilterText("curso")
        }, { title: "Importante:", detail: "<i>Junto con la Materia se borrarán los horarios de la misma", quotes: false }])
    }

    listOnContentReady(e) {
        super.listOnContentReady(e);
        if (this.toolbar().isReady()) {
            this.toolbar().setItems(this.toolbarItems());
        }
    }

}

class MateriasCursoForm extends FormView {

    transformInsertUpdate(data, verb) {
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

    duplicatedMessage() {
        return Messages.Section({ title: "Ya esta asociada la Materia:", detail: this.getEditorText("materia") })
    }


    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.curso().id);
        }
    }

}