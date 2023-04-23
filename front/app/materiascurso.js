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
                    width: 250,
                    height: 70,
                },
                toolbar: {
                    visible: false
                },
                list: {
                    showBorders: true
                }
            }
        }
    }

    refreshListToolbar() {
        this.list().setToolbarItems(this.listToolbarItems())
    }

    listToolbarItems() {
        return [this.itemInsert(), this.itemHorarios(), this.itemExportExcel(), "searchPanel"]
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

    itemSpace() {
        return {
            text: "   ",
            location: "before"
        }
    }

    itemHorarios() {
        if (this.list().hasRows() && this.configuration().showHorarios != false) {
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

    itemExamenes() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Trabajos Prácticos",
                    icon: "file",
                    onClick: e => this.examenes()
                }
            }
        }
    }

    examenes() {
        new ExamenesCurso(this.detailData()).render();
    }

    horarios() {
        new MateriasHorasCurso(this.detailData()).render()
            .then(closeData =>
                closeData.dataHasChanged ? this.refresh(this.id()) : undefined)
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
        return Messages.Build([{
            message: "Borra la Materia ?",
            detail: this.focusedRowValue("materianombre")
        }, {
            message: "dictada en el Curso",
            detail: this.cursoDescripcion()
        }, this.focusedRowValue("horarios") != "" ? {
            message: "Importante:",
            detail: "<i>Junto con la Materia se borrarán los horarios de la misma<br><br>" + Html.Tab(2) + "( " + this.horariosText() + " )",
            quotes: false
        } : undefined])
    }

    horariosText() {
        return this.focusedRowValue("horarios").replace("<br><br>", ", ")
    }

    rowDescription() {
        return this.focusedRowValue("materianombre");
    }

    listOnContentReady(e) {
        this.focusFirstRow();
        this.refreshListToolbar();
        this.refreshContextMenuItems()
    }

}

class MateriasCursoForm extends FormView {

    transformData(data) {
        return Utils.NormalizeData({
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
        return Messages.Build([{
            message: "Ya esta asociada la Materia:",
            detail: this.getEditorText("materia")
        }, { message: "para el Curso", detail: this.listView().cursoDescripcion() }])
    }

    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.curso().id);
        }
    }

}