class MateriasHorasCurso extends CursosMateriasDetalle {

    extraConfiguration() {
        return {
            popup: {
                title: "Horarios por Curso y Materia",
            }
        }
    }

    itemCurso() {
        return super.itemCurso({ readOnly: true })
    }

    setDataSource(materiacurso) {
        if (materiacurso != undefined) {
            this.list().setDataSource(
                Ds({
                    path: this.path(),
                    filter: { materiacurso: materiacurso }
                })
            )
        } else {
            this.list().setDataSource(null);
        }
    }

    listColumns() {
        return this.class().ListColumns();
    }

    formViewClass() {
        return MateriasHorasCursoForm;
    }

    itemMateriaCursoOnValueChanged(e) {
        this.setDataSource(e.value)
    }

    path() {
        return "materias_horas";
    }

    deleteMessage() {
        return Messages.Build([{
                message: "Borra este horario ?",
                detail: this.descripcion()
            }, {
                message: "de la Materia",
                detail: this.getFilterText("materiacurso")
            },
            {
                message: "perteneciente al Curso:",
                detail: this.cursoDescripcion()
            }
        ])
    }

    descripcion() {
        const a = "a";
        const row = this.focusedRowData();
        return DiasSemana.GetNombre(row.dia) + ", " + row.desde.substring(0, 5) + " - " + row.hasta.substring(0, 5)
    }

    static ListColumns() {
        return [
            Column.Id(),
            Column.Calculated({
                dataField: "dia",
                width: 300,
                caption: "Dia de la Semana",
                formula: row => DiasSemana.GetNombre(row.dia)
            }),
            Column.Date({ dataField: "desde", width: 200, caption: "Hora Desde", format: App.TIME_FORMAT_SHORT }),
            Column.Date({ dataField: "hasta", caption: "Hora Hasta", format: App.TIME_FORMAT_SHORT }),
            Column.Space()
        ]
    }

}

class MateriasHorasCursoForm extends FormView {

    transformInsertUpdate(data, verb) {
        return Utils.ReduceIds({
            id: data.id,
            materiacurso: this.materiaCurso(),
            dia: data.dia,
            desde: Dates.TimeAsString(data.desde),
            hasta: Dates.TimeAsString(data.hasta)
        })
    }

    popupConfiguration() {
        return {
            title: () => "Horario de " + this.materiaNombre(),
            width: 750,
            height: 400
        }
    }

    formItems() {
        return [
            Item.Id(),
            Item.Group({
                colCount: 3,
                items: [
                    Item.ReadOnly({ dataField: "añolectivo", label: "Año Lectivo" }),
                    Item.ReadOnly({ dataField: "cursodescripcion", label: "Curso", colSpan: 2 }),
                ]
            }),
            Item.Group({
                items: [
                    Item.Text({
                        dataField: "materianombre",
                        readOnly: true,
                        value: this.materiaNombre(),
                        width: 250,
                        label: "Materia"
                    }),
                ]
            }),
            Item.Group({
                items: [
                    Item.Lookup({
                        dataField: "dia",
                        dataSource: DiasSemana.DataSource(),
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

    materiaCurso() {
        return this.listView().materiaCurso();
    }

    materiaNombre() {
        return this.listView().materiaNombre();
    }

    firstEditor() {
        return "dia";
    }

    transformGetData(data) {
        data.desde = Dates.DateFromHour(data.desde);
        data.hasta = Dates.DateFromHour(data.hasta);
        return data;
    }

}