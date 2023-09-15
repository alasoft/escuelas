class MateriasCurso extends CursosDetalle {

    path() {
        return "materias_cursos";
    }

    defineTemplate() {
        return new MateriasCursoTemplate()
    }

    extraConfiguration() {
        return {
            popup: {
                title: "Materias Dictadas en el Curso",
            },
            components: {
                filter: {
                    width: 400,
                    height: 50,
                },
                toolbar: {
                    visible: false
                },
                list: {
                    showBorders: true
                },
                bottomToolbar: {
                    componentClass: Toolbar,
                }
            }
        }
    }

    bottomToolbar() {
        return this.components().bottomToolbar;
    }

    refreshListToolbar() {
        this.list().setToolbarItems(this.listToolbarItems())
    }

    refreshBottomToolbar() {
        return this.bottomToolbar().setItems([this.itemHorarios()])
    }

    listToolbarItems() {
        return [this.itemInsert(), this.itemExcelExport(), "searchPanel"]
    }

    labelText() {
        return "Materias por Curso"
    }

    itemCurso() {
        return super.itemCurso({ deferRendering: false })
    }

    setState() {
        if (this.parameters().isDetail == true) {
            this.state.añoLectivo = this.parameters().añoLectivo;
            this.state.curso = this.parameters().curso;
        }
        super.setState()
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
            message: "dicatada en el Curso",
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
        this.refreshContextMenuItems();
        this.refreshBottomToolbar();

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
            title: "Materia Dictada",
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
            message: "La Materia:",
            detail: this.getEditorText("materia")
        }, { message: "ya esta asociada para el Curso", detail: this.listView().cursoDescripcion() }])
    }

    popupOnHidden(e) {
        if (this.masterView() != undefined) {
            this.masterView().focusRowById(this.curso().id);
        }
    }

}

class MateriasCursoTemplate extends ListViewTemplate {

    topItems() {
        return super.topItems().concat({
            name: "bottomToolbar",
            backgroundColor: App.BOX_BACKGROUND_COLOR,
        })
    }

}