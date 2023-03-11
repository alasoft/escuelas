class MateriasDiasAll extends AñoCursoMateriaFilterView {

    path() {
        return "materias_dias_all";
    }

    labelText() {
        return "Dias y Horas de Materias";
    }

    listToolbarItems() {
        return [this.itemInsert(), this.itemCalendario(), this.itemExport(), this.itemSearchPanel()]
    }

    itemCalendario() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "event",
                text: "Calendario",
                onClick: e => this.calendario()
            }
        }
    }

    listColumns() {
        return [
            Column.Id(),
            Column.Calculated({
                dataField: "dia",
                width: 130,
                caption: "Dia",
                formula: row => DiasSemana.GetNombre(row.dia)
            }),
            Column.Date({ dataField: "desde", width: 130, caption: "Desde", format: App.TIME_FORMAT_SHORT }),
            Column.Date({ dataField: "hasta", caption: "Hasta", width: 130, format: App.TIME_FORMAT_SHORT }),
            Column.Calculated({
                dataField: "curso",
                formula: row => Cursos.Descripcion(row),
                caption: "Curso",
                width: 400
            }),
            Column.Text({ dataField: "materianombre", caption: "Materia", width: 150 }),
        ]
    }

    formViewClass() {
        return MateriasDiasAllForm;
    }

    calendario() {
        new DiasCalendario({ añoLectivo: this.añoLectivo() }).render();
    }

}

class MateriasDiasAllForm extends MateriasDiasForm {

    popupConfiguration() {
        return {
            title: "Horario",
            width: 750,
            height: 400
        }
    }

    añoLectivo() {
        return this.listView().añoLectivo();
    }

    materiaCurso() {
        return this.getEditorValue("materiacurso");
    }

    formItems() {
        return [
            Item.Id(),
            Item.Group({
                colCount: 2,
                items: [
                    Item.Lookup({
                        dataField: "curso",
                        dataSource: Ds({ path: "cursos", filter: { añoLectivo: this.añoLectivo() } }),
                        displayExpr: item => Cursos.Descripcion(item),
                        width: 400,
                        colSpan: 2,
                        onValueChanged: e => this.cursoOnValueChanged(e)
                    }),
                    Item.Lookup({
                        dataField: "materiacurso",
                        displayExpr: item => item != null ? item.materianombre : "",
                        width: 250,
                        label: "Materia",
                        colSpan: 2,
                        onValueChanged: e => this.materiaCursoOnValueChanged(e)
                    }),
                    Item.Lookup({
                        dataField: "dia",
                        dataSource: DiasSemana.DataSource(),
                        width: 130,
                        label: "Dia de la Semana",
                    }),

                ]
            }),
            Item.Group({
                colCount: 3,
                items: [
                    Item.Time({
                        dataField: "desde",
                        label: "Hora desde",
                    }),
                    Item.Time({
                        dataField: "hasta",
                        label: "Hora hasta",
                    })
                ]
            })

        ]
    }

    setMateriaCursoDataSource(curso) {
        if (curso != undefined) {
            this.form().setEditorDataSource("materiacurso",
                Ds({
                    path: "materias_cursos",
                    filter: { curso: curso },
                }),
            );
        } else {
            this.filter().setEditorDataSource("materiacurso", null);
        }
    }

    cursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

    materiaCursoOnValueChanged(e) {

    }

}