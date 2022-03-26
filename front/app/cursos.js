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
                    },
                    filterRow: {
                        //                        visible: true,
                        applyFilter: 'auto',
                    },
                }
            }
        }
    }

    listToolbarItems() {
        return [this.itemInsert(), this.itemMaterias(),
            this.itemAlumnos(), this.itemTps(),
            this.itemExportButton(), this.itemSearchPanel()
        ]
    }

    /*    
        itemAdd() {
            if (this.añoLectivoValue() == Dates.ThisYear()) {
                return super.itemAdd();
            }
        }
    */

    itemCopy() {
        if (this.añoLectivoValue() == Dates.ThisYear() && this.list().isEmpty()) {
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
        new MateriasCurso({
            mode: "popup",
            añoLectivo: this.filter().getEditorValue("añoLectivo"),
            curso: this.list().focusedRowData(),
            masterView: this
        }).render();
    }

    showAlumnos() {
        new AlumnosCurso({
            mode: "popup",
            añoLectivo: this.filter().getEditorValue("añoLectivo"),
            curso: this.list().focusedRowData(),
            masterView: this
        }).render();
    }

    showTps() {
        new TpsCurso({
            mode: "popup",
            añoLectivo: this.filter().getEditorValue("añoLectivo"),
            curso: this.list().focusedRowData(),
            masterView: this
        }).render();
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "escuelanombre", caption: "Escuela", width: 300 }),
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
                    Item.ReadOnly({ dataField: "añoLectivo", width: 100 }),
                    Item.Lookup({
                        dataField: "escuela",
                        dataSource: Escuelas.DataSource(),
                        required: true,
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

    firstEditor() {
        return "escuela";
    }

}