class DiasCalendario extends View {

    beforeRender() {
        return new Rest({
                path: "materias_horas_all",
            }).promise({
                verb: "list",
                data: { añolectivo: this.parameters().añoLectivo }
            })
            .then(rows =>
                this.transformRows(rows))
            .then(rows =>
                this.dataSource = rows)
    }

    transformRows(rows) {

        function text(row) {
            return row.materianombre + " " +
                Cursos.Descripcion(row) + " " +
                DiasSemana.GetAbrevia(row.dia) + " " +
                row.desde + " - " +
                row.hasta
        }

        function fechaHora(day, hour) {
            let date = Dates.DateFromDayOfWeek(Dates.Today(), day);
            return Dates.SetTime(date, hour)
        }

        rows.forEach(
            row => {
                row.text = text(row);
                row.fechaDesde = fechaHora(row.dia, row.desde);
                row.fechaHasta = fechaHora(row.dia, row.hasta);
            }
        )

        return rows;

    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Horarios de Materias",
                fullScreen: true,
                height: window.screen.height - 100,
                width: window.screen.width - 50,
                resizeEnabled: true
            },
            components: {
                scheduler: this.schedulerConfiguration()
            }
        }
    }

    schedulerConfiguration(dataSource) {
        return {
            dataSource: this.dataSource,
            editing: {
                allowDragging: false,
                allowUpdating: false,
                allowAdding: false,
                allowDeleting: false,
                allowResizing: false
            },
            dateCellTemplate: (itemData, itemIndex, itemElement) =>
                $("<div>").text(DiasSemana.GetAbrevia(itemData.date.getDay())).css({
                    "margin": 5
                }),
            appointmentTemplate: model => {
                const data = model.appointmentData;
                return $("<div>").html(data.materianombre +
                    "<br>" +
                    Cursos.Descripcion(data) +
                    "<br><br>" +
                    data.desde + " - " + data.hasta).css({ "font-size": "x-small" })
            },
            height: 350,
            onAppointmentDblClick: (e, a) =>
                e.cancel = true,
            onContentReady: e =>
                this.schedulerOnContentReady(e),
            onAppointmentFormOpening: e =>
                e.cancel = true,
            onCellClick: e =>
                e.cancel = true
        }

    }

    defineTemplate() {
        return new Template({
            fillContainer: true,
            orientation: "vertical",
            items: [{
                name: "scheduler",
                fillContainer: true,
                backgroundColor: "lightyellow",
                orientation: "vertical",
                height: 0
            }]
        })
    }

    schedulerOnContentReady(e) {
        this.template().hideElementByClass("dx-toolbar-items-container");
        this.template().setElementStyleByClass("dx-scheduler-header", { "height": "0px" })
    }

}