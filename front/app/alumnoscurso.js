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

    toolbarItems() {
        return [this.itemInsert(), this.itemImport(), this.itemExport()]
    }

    labelText() {
        return "Alumnos por Curso"
    }

    itemImport() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "group",
                text: "Importa de Excel",
                onClick: e => this.importAlumnos(e)
            }
        }
    }

    importAlumnos() {
        new ImportAlumnos().render();
    }

    showMessageImportacion() {
        return App.ShowMessage([{
            message: "Este proceso permitirá cargar Alumnos de una Planilla Excel, de acuerdo a las siguientes reglas:",
            quotes: false,
            detail: [
                "1. Deben existir las columnas 'Apellido' y 'Nombre' en la Planilla Excel.",
                "2. Los alumnos a importar no deben existir previamente en el curso.",
                "3. Puede existir una columna adicional 'Email'. Si existe el Email no puede repetirse.",
            ]
        }, {
            message: "<i>Importante:",
            quotes: false,
            detail: [
                "- Usted podrá visualizar los datos a importar antes de confirmar la operacion.",
                "- Los renglones con errores se mostrarán pero no generarán nuevos Alumnos."
            ]
        }], { height: 350, width: 650 })
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
            message: "Borra " + this.generoArticulo() + " ?",
            detail: this.focusedRowValue("apellido") + " " + this.focusedRowValue("nombre")
        }, {
            message: "perteneciente al Curso:",
            detail: this.cursoDescripcion()
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
            message: "Ya existe un Alumno con Apellido y Nombre:",
            detail: this.getEditorText("apellido") + ", " + this.getEditorText("nombre")
        }, {
            message: "en el Curso:",
            detail: this.listView().cursoDescripcion()
        }])
    }

}