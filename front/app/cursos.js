class Cursos extends AñoLectivoFilterView {

    path() {
        return "cursos"
    }

    extraConfiguration() {
        return {
            components: {
                label: {
                    text: "Cursos"
                },
                list: {
                    groupPanel: {
                        visible: true
                    }
                }
            },
            operations: {
                allowExport: true
            }
        }
    }

    listToolbarItems() {
        return [this.itemInsert(), this.itemMaterias(),
            this.itemAlumnos(), this.itemTps(),
            this.itemExportButton(), this.itemSearchPanel()
        ]
    }

    itemCopy() {
        if (this.añolectivoValue() == Dates.ThisYear() && this.list().isEmpty()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Copia Cursos y Materias del año anterior",
                    onClick: e => this.copyCursosMaterias(e)
                }
            }
        }
    }

    itemMaterias() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Materias",
                    icon: "folder",
                    onClick: e => this.showMaterias(e)
                }
            }
        }
    }

    itemAlumnos() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Alumnos",
                    icon: "group",
                    onClick: e => this.showAlumnos(e)
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
                    icon: "check",
                    onClick: e => this.showTps(e)
                }
            }
        }
    }

    copyCursosMaterias() {
        new CursosMaterias({ cursosView: this }).render();
    }

    showMaterias() {
        new MateriasCurso(this.detailParameters()).render();
    }

    showAlumnos() {
        new AlumnosCurso(this.detailParameters()).render();
    }

    showTps() {
        new TpsCurso(this.detailParameters()).render();
    }

    detailParameters() {
        return {
            añolectivo: this.filter().getEditorValue("añolectivo"),
            curso: this.list().focusedRowData(),
            masterView: this
        }
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "escuelanombre", caption: "Escuela", width: 300, filtering: true }),
            Column.Text({ dataField: "modalidadnombre", caption: "Modalidad" }),
            Column.Invisible({ dataField: "año" }),
            Column.Calculated({ formula: row => Años.GetNombre(row.año), caption: "Año" }),
            Column.Text({ dataField: "division", caption: "División" }),
            Column.Calculated({ formula: row => Turnos.GetNombre(row.turno), caption: "Turno" })
        ]
    }

    formViewClass() {
        return CursosForm;
    }

    firstEditor() {
        return "escuela";
    }

    excelFileName() {
        return "Cursos " + this.filterText("añolectivo");
    }

    deleteMessageParameters() {
        return {
            prefix: "este Curso",
            expression: Cursos.Descripcion(this.focusedRowData())
        }
    }

    static Descripcion(item) {
        if (Utils.IsDefined(item)) {
            return Utils.Concatenate([
                item.escuelanombre,
                item.modalidadnombre,
                Años.GetNombre(item.año),
                item.division,
                Turnos.GetNombre(item.turno)
            ], ", ")
        } else {
            return ""
        }
    }

}

class CursosForm extends FormView {

    defineRest() {
        return new Rest({
            path: "cursos",
            transformData: (verb, data) => Utils.ReduceIds(data)
        })
    }

    popupExtraConfiguration() {
        return {
            title: "Curso",
            width: 650,
            height: 500
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Group({
                items: [
                    Item.ReadOnly({ dataField: "añolectivo", width: 100 }),
                    Item.Lookup({
                        dataField: "escuela",
                        dataSource: Escuelas.DataSource(),
                        required: true,
                        editable: true
                    }),
                    Item.Lookup({
                        dataField: "modalidad",
                        dataSource: Modalidades.DataSource(),
                        width: 250,
                        required: true,
                    })
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    Item.Lookup({
                        dataField: "año",
                        dataSource: Años.DataSource(),
                        required: true
                    }),
                    Item.Text({
                        dataField: "division",
                        required: true,
                        case: "upper",
                        width: 80,
                        label: "División"
                    }),
                ]
            }),
            Item.Group({
                colCount: 2,
                items: [
                    Item.Lookup({
                        dataField: "turno",
                        dataSource: Turnos.DataSource(),
                        required: true,
                    })
                ]
            })
        ]
    }

}