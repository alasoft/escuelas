class Cursos extends AñoLectivoFilterView {

    path() {
        return "cursos"
    }

    extraConfiguration() {
        return {
            components: {
                label: {
                    text: "Cursos"
                }
            },
            operations: {
                allowExport: true
            }
        }
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

    copyCursosMaterias() {
        new CursosMaterias({ cursosView: this }).render();
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
            transformData: (verb, data) => this.transformData(verb, data)
        })
    }

    transformData(verb, data) {
        return {
            id: data.id,
            escuela: data.escuela,
            modalidad: data.modalidad,
            año: data.año,
            division: data.division,
            turno: data.turno
        }
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