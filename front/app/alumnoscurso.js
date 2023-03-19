class AlumnosCurso extends CursosDetalle {

    path() {
        return "alumnos";
    }

    extraConfiguration() {
        return {
            popup: {
                title: "Alumnos por Curso"
            },
            components: {
                filter: {
                    width: 280
                }
            }
        }
    }

    labelText() {
        return "Alumnos por Curso"
    }

    itemCurso() {
        return super.itemCurso({ deferRendering: false })
    }

    cursoLoadFirst() {
        return false;
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
            Column.Text({ dataField: "email" })
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
        return Messages.Build([{
            title: "Borra " + this.generoArticulo() + " ?",
            detail: this.focusedRowValue("apellido") + " " + this.focusedRowValue("nombre")
        }, {
            title: "perteneciente al Curso:",
            detail: this.getFilterText("curso")
        }]);
    }

    generoArticulo() {
        return "el Alumno"
    }

}

class AlumnosCursoForm extends FormView {

    transformInsertUpdate(data, verb) {
        return Utils.ReduceIds({
            id: data.id,
            curso: data.curso,
            apellido: data.apellido,
            nombre: data.nombre,
            genero: data.genero,
            email: data.email
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
            Item.Email({ dataField: "email", clearButton: true })
        ]
    }

    firstEditor() {
        return "apellido";
    }

    duplicatedMessage() {
        return Messages.Build([{
            title: "Ya existe un Alumno con Apellido y Nombre:",
            detail: this.getEditorText("apellido") + ", " + this.getEditorText("nombre")
        }, {
            title: "en el Curso:",
            detail: this.listView().cursoDescripcion()
        }])
    }


}