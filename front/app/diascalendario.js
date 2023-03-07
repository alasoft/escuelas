class DiasCalendario extends View {

    extraConfiguration() {
        return {
            mode: "popup",
            components: {
                scheduler: {
                    dataSource: this.dataSource(),
                    dateCellTemplate: (itemData, itemIndex, itemElement) =>
                        $("<div>").text(DiasSemana.GetAbrevia(itemData.date.getDay())).css({
                            "margin": 5
                        }),
                    currentDate: new Date(App.BASE_DATE),
                    height: 400,
                    onContentReady: e => this.schedulerOnContentReady(e)
                }
            }
        }
    }

    defineTemplate() {
        return new Template({
            fillContainer: true,
            orientation: "vertical",
            backgroundColor: "lightyellow",
            items: [{
                name: "scheduler",
                fillContainer: true,
                orientation: "vertical"
            }]
        })
    }

    dataSource() {
        if (this._dataSource == undefined) {
            this._dataSource = this.defineDataSource()
        }
        return this._dataSource;
    }

    defineDataSource() {
        return Ds({
            path: "materias_dias_all",
            filter: {
                añolectivo: this.parameters.añoLectivo,
                curso: this.parameters.curso,
                materiacurso: this.parameters.materiacurso,
            },
            transformData: data => this.transformData(data)
        })
    }

    transformData(data) {
        const d = new Date();
        data.forEach(
            row => {
                row.desde = Dates.DateFromHour(row.desde);
                row.hasta = Dates.DateFromHour(row.hasta)
            }
        )
        this.mondays();
        return data;
    }

    mondays() {
        var d = new Date(),
            month = d.getMonth(),
            mondays = [];

        d.setDate(1);

        // Get the first Monday in the month
        while (d.getDay() !== 1) {
            d.setDate(d.getDate() + 1);
        }

        // Get all the other Mondays in the month
        while (d.getMonth() === month) {
            mondays.push(new Date(d.getTime()));
            d.setDate(d.getDate() + 7);
        }

        return mondays;
    }

    schedulerOnContentReady(e) {
        //        $(".dx-toolbar-items-container").css("display", "none");
    }

}