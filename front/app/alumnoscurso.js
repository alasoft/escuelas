class AlumnosCurso extends CursosDetalle {

    extraConfiguration() {
        return {
            mode: "view"
        }
    }

    path() {
        return "alumnos";
    }

    labelText() {
        return "Alumnos por Curso"
    }

    itemAñoLectivo() {
        return super.itemAñoLectivo({ readOnly: false })
    }

    itemCurso() {
        return super.itemCurso({ deferRendering: false })
    }

    itemImport() {
        if (this.añoLectivo() == Dates.ThisYear() && this.curso() != undefined) {
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
        return "Alumnos de " + this.getFilterText("curso") + " / " + this.getFilterText("añolectivo");
    }

    exportExcelDialogWidth() {
        return 750
    }

    deleteMessage() {
        return "<b>Borra " + this.generoArticulo() + " ?<br><br>" + Html.Tab() +
            Strings.SingleQuotes(this.focusedRowValue("apellido") + " " + this.focusedRowValue("nombre")) +
            "<br><br>perteneciente al Curso:<br><br>" + Html.Tab() +
            Strings.SingleQuotes(this.getFilterText("curso"))
    }

    generoArticulo() {
        if (this.focusedRowValue("genero") == "M") {
            return "el Alumno"
        } else {
            return "la Alumna";
        }
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
        return Utils.ReduceIds({
            id: data.id,
            curso: data.curso,
            apellido: data.apellido,
            nombre: data.nombre,
            genero: data.genero
        })
    }


    popupConfiguration() {
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
            Item.ReadOnly({ dataField: "cursodescripcion", label: "Curso" }),
            Item.Text({ dataField: "apellido", required: true, width: 250 }),
            Item.Text({ dataField: "nombre", required: true, width: 250 }),
            Item.Lookup({ dataField: "genero", required: true, dataSource: Generos.DataSource(), width: 150 })
        ]
    }

    firstEditor() {
        return "apellido";
    }

}