class AlumnosCurso extends CursosDetalle {

    extraConfiguration() {
        return {
            operations: {
                allowExport: true
            }
        }
    }

    labelText() {
        return "Alumnos por Curso"
    }

    path() {
        return "alumnos";
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
            Column.Text({ dataField: "nombre" }),
            Column.Calculated({ formula: row => Generos.GetNombre(row.genero), caption: "Género" })
        ]
    }

    formViewClass() {
        return AlumnosCursoForm;
    }

    excelFileName() {
        return "Alumnos de " + this.filterText("curso");
    }

    exportExcelDialogWidth() {
        return 750
    }

}

class AlumnosCursoForm extends FormView {

    defineRest() {
        return new Rest({
            path: "alumnos",
            transformData: (verb, data) => this.transformData(verb, data)
        })
    }

    transformData(verb, data) {
        return {
            id: data.id,
            curso: data.curso,
            apellido: data.apellido,
            nombre: data.nombre,
            genero: data.genero.id
        }
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
            Item.ReadOnly({ dataField: "añolectivo", width: 80, label: "Año Lectivo" }),
            Item.ReadOnly({ dataField: "descripcion", label: "Curso" }),
            Item.Text({ dataField: "nombre", required: true, width: 250 }),
            Item.Text({ dataField: "apellido", required: true, width: 250 }),
            Item.Lookup({ dataField: "genero", required: true, dataSource: Generos.DataSource(), width: 150 })
        ]
    }

    firstEditor() {
        return "nombre";
    }

}