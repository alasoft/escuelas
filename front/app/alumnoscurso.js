class AlumnosCurso extends CursosDetalle {

    finalConfiguration() {
        return {
            popup: {
                width: 850,
                height: 600
            }
        }
    }

    labelText() {
        return "Alumnos por Curso"
    }

    path() {
        return "alumnos";
    }

    listToolbarItems() {
        return [this.itemInsert(),
            this.itemSearchPanel()
        ]
    }

    itemImport() {
        if (this.añolectivo().id == Dates.ThisYear() && this.curso() != undefined) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    text: "Importar Alumnos de planilla Excel"
                }
            }
        }
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "apellido", width: 250 }),
            Column.Text({ dataField: "nombres" }),
            Column.Calculated({ formula: row => Generos.GetNombre(row.genero), caption: "Género" })
        ]
    }

    formViewClass() {
        return AlumnosCursoForm;
    }

}

class AlumnosCursoForm extends FormView {

    defineRest() {
        return new Rest({
            path: "alumnos",
            transformData: (verb, data) => {
                data.genero = data.genero.id
            }
        })
    }

    popupExtraConfiguration() {
        return {
            title: "Alumno",
            width: 600,
            height: 450
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.ReadOnly({ dataField: "curso.añolectivo", width: 80, label: "Año Lectivo" }),
            Item.ReadOnly({ dataField: "curso.descripcion", label: "Curso" }),
            Item.Text({ dataField: "apellido", required: true, width: 250 }),
            Item.Text({ dataField: "nombres", required: true, width: 250 }),
            Item.Lookup({ dataField: "genero", required: true, dataSource: Generos.DataSource(), width: 150 })
        ]
    }

    firstEditor() {
        return "apellido";
    }

}