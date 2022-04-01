class MateriasCurso extends CursosDetalle {

    labelText() {
        return "Materias del Curso"
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

    popupExtraConfiguration() {
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