class MateriasCurso extends CursosDetalle {

    extraConfiguration() {
        return {
            popup: {
                title: "Materias del Curso",
            }
        }
    }

    path() {
        return "materias_cursos";
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Text({ dataField: "materianombre", caption: "Materia" })
        ]
    }

    formViewClass() {
        return MateriasCursoForm;
    }

    deleteMessage() {
        return "Borra esta Materia ?<br><br>" +
            Utils.SingleQuotes(this.focusedRowValue("materianombre")) +
            "<br><br>dictada en el Curso:<br><br>" + Utils.SingleQuotes(this.filterText("curso"))
    }

}

class MateriasCursoForm extends FormView {

    defineRest() {
        return new Rest({ path: "materias_cursos", transformData: (verb, data) => this.transformData(verb, data) })
    }

    transformData(verb, data) {
        return {
            id: data.id,
            curso: data.curso,
            materia: data.materia.id
        }
    }

    popupConfiguration() {
        return {
            title: "Materia del Curso",
            width: 600,
            height: 450
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.ReadOnly({ dataField: "añolectivo", width: 80, label: "Año Lectivo" }),
            Item.ReadOnly({ dataField: "descripcion", label: "Curso" }),
            Item.Lookup({ dataField: "materia", dataSource: Materias.DataSource(), required: true, width: 250 })
        ]
    }

    firstEditor() {
        return "materia";
    }

}