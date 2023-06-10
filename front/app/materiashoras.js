class MateriasHoras extends AñoLectivoView {

    path() {
        return "materias_horas_all";
    }

    extraConfiguration() {
        return {
            popup: {
                title: "Horarios"
            },
            components: {
                filter: {
                    height: 50
                }
            }
        }
    }

    labelText() {
        return "Horarios de Materias";
    }

    toolbarItems() {
        return [this.itemInsert()]
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
            Column.Text({ dataField: "escuelanombre", caption: "Escuela", width: 200, filterWidth: 300 }),
            Column.Empty()
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
        return MateriasHorasForm;
    }

    calendario() {
        new DiasCalendario({ añoLectivo: this.añoLectivo() }).render();
    }

    excelFileName() {
        return "Horarios " + this.getFilterText("añolectivo");
    }

    deleteMessage() {
        const row = this.focusedRowData();
        return Messages.Build([{
            message: "Borra el horario ?",
            detail: DiasSemana.GetNombre(row.dia) + " " + row.desde.substring(0, 5) + " - " + row.hasta.substring(0, 5)
        },
        {
            message: "de la Materia",
            detail: this.focusedRowValue("materianombre")
        }, {
            message: "perteneciente al Curso:",
            detail: this.cursoDescripcion()
        }
        ]);
    }

    cursoDescripcion() {
        return Cursos.Descripcion(this.focusedRowData()) + " / " + this.getFilterValue("añolectivo")
    }

}

class MateriasHorasForm extends CursosMateriasForm {

    path() {
        return "materias_horas";
    }

    transformData(data) {
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
            height: 450
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Group({
                colCount: 2,
                items: [
                    Item.ReadOnly({
                        dataField: "añolectivo",
                        width: 100
                    })
                ]
            }),
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