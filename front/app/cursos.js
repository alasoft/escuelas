class Cursos extends AñoLectivoFilterView {

    constructor(parameters) {
        super(parameters);
    }

    extraConfiguration() {
        return {
            components: {}
        }
    }

    path() {
        return "cursos"
    }

    labelText() {
        return "Cursos";
    }

    toolbarItems() {
        return [this.itemInsert(), this.itemAlumnosCurso(), this.itemMateriasCurso()]
    }


    itemAlumnosCurso() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "user",
                    text: "Alumnos",
                    onClick: e => this.alumnosCurso()
                }
            }
        }
    }

    itemMateriasCurso() {
        if (this.list().hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "copy",
                    text: "Materias Dictadas",
                    onClick: e => this.materiasCurso()
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
                    icon: "background",
                    text: "Trabajos Prácticos",
                    onClick: e => this.tps()
                }
            }
        }
    }

    alumnosCurso() {
        new AlumnosCurso({
            masterView: this,
            añolectivo: this.añoLectivo(),
            curso: this.id()
        }).render()
    }

    materiasCurso() {
        new MateriasCurso({
            masterView: this,
            añolectivo: this.añoLectivo(),
            curso: this.id()
        }).render()
    }

    tps() {
        new TpsCurso({
            masterView: this,
            añolectivo: this.añoLectivo(),
            curso: this.id(),
        }).render();
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

    excelFileName() {
        return "Cursos " + this.getFilterText("añolectivo");
    }

    deleteMessage() {
        return this.composeDeleteMessage({ title: "este Curso", description: this.descripcion() })
    }

    descripcion() {
        return Cursos.Descripcion(this.focusedRowData());
    }

    static Descripcion(data) {
        if (Utils.IsDefined(data)) {
            return Strings.Concatenate([
                data.escuelanombre,
                data.modalidadnombre,
                Años.GetNombre(data.año),
                data.division,
                Turnos.GetNombre(data.turno)
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
            transformData: (verb, data) => this.transformData(verb, data),
            headers: verb => this.headers(verb)
        })
    }

    headers(verb) {
        if (Strings.StringIs(verb, "insert,update")) {
            return {
                [App.CLIENT_DESCRIPTION_HEADER]: this.descripcion()
            }
        }
    }

    descripcion() {
        return this.concatenateTexts("escuela,modalidad,año+division,turno")
    }

    transformData(verb, data) {
        return Utils.ReduceIds({
            id: data.id,
            escuela: data.escuela,
            modalidad: data.modalidad,
            añolectivo: data.añolectivo,
            año: data.año,
            division: data.division,
            turno: data.turno
        })
    }

    popupConfiguration() {
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

    firstEditor() {
        return "escuela";
    }

}