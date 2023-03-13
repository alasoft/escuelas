class Horas extends AñoLectivoFilterView {

    path() {
        return "materias_dias_all";
    }

    extraConfiguration() {
        return {
            fullScreen: false,
        }
    }

    labelText() {
        return "Horarios de Materias";
    }

    toolbarItems() {
        return [this.itemInsert(), this.itemCalendario(), this.itemExport()]
    }

    itemCalendario() {
        if (this.hasRows()) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "event",
                    text: "Calendario",
                    onClick: e => this.calendario()
                }
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
                formula: row => DiasSemana.GetNombre(row.dia),
                sort: (s1, s2) => this.sortDia(s1, s2)
            }),
            Column.Time({ dataField: "desde", width: 130, caption: "Hora Desde", format: App.TIME_FORMAT_SHORT }),
            Column.Time({ dataField: "hasta", caption: "Hora Hasta", width: 130, format: App.TIME_FORMAT_SHORT }),
            this.columnCurso(),
            Column.Text({ dataField: "materianombre", caption: "Materia", width: 150 }),
            Column.Text({ dataField: "escuelanombre", caption: "Escuela", width: 200, filterWidth: 300 })
        ]
    }

    sortDia(s1, s2) {
        const d1 = DiasSemana.GetId(s1);
        const d2 = DiasSemana.GetId(s2);
        if (d1 < d2) {
            return -1;
        }
        if (d1 == d2) {
            return 0;
        }
        return 1;
    }

    setDataSource() {
        if (this.añoLectivo() != undefined) {
            this.list().setDataSource(Ds({
                path: this.path(),
                filter: { añolectivo: this.añoLectivo() }
            }))
        } else {
            this.list().setDataSource(null);
        }
    }

    formViewClass() {
        return HorasForm;
    }

    calendario() {
        new DiasCalendario({ añoLectivo: this.añoLectivo() }).render();
    }

}

class HorasForm extends CursosMateriasForm {

    path() {
        return "materias_dias";
    }

    transformInsertUpdate(data, verb) {
        return {
            id: data.id,
            materiacurso: data.materiacurso,
            dia: data.dia,
            desde: Dates.TimeAsString(data.desde),
            hasta: Dates.TimeAsString(data.hasta)
        }
    }

    popupConfiguration() {
        return {
            title: "Horario",
            width: 750,
            height: 400
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Group({
                colCount: 2,
                items: [
                    this.itemCurso(),
                    this.itemMateriaCurso(),
                    Item.Lookup({
                        dataField: "dia",
                        dataSource: DiasSemana.DataSource(),
                        required: true,
                        width: 130,
                        label: "Dia de la Semana",
                    })
                ]
            }),
            Item.Group({
                colCount: 3,
                items: [
                    Item.Time({
                        dataField: "desde",
                        required: true,
                        label: "Hora desde"
                    }),
                    Item.Time({
                        dataField: "hasta",
                        required: true,
                        label: "Hora hasta",
                    })
                ]
            })

        ]
    }

    afterGetData(data) {
        data.desde = Dates.DateFromHour(data.desde);
        data.hasta = Dates.DateFromHour(data.hasta);
        return super.afterGetData(data)
    }

    cursoOnValueChanged(e) {
        this.setMateriaCursoDataSource(e.value);
    }

}