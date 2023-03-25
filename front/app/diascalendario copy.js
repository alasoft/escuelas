class DiasCalendario extends View {

    data = [];

    afterRender() {
        new Rest({
                path: "materias_horas_all",
            }).promise({
                verb: "list",
                data: { añolectivo: 2023 }
            })
            .then(rows =>
                this.transformData(rows))
            .then(rows =>
                this.components().scheduler.setProperty("dataSource", this.dataSource(rows)))
    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                fullScreen: true,
            },
            components: {
                scheduler: {
                    //                    dataSource: this.data
                    //                    keyExpr: "id",
                    //                    dataSource: this.dataSource(),
                    /*                    
                                        dateCellTemplate: (itemData, itemIndex, itemElement) =>
                                            $("<div>").text(DiasSemana.GetAbrevia(itemData.date.getDay())).css({
                                                "margin": 5
                                            }),
                    */
                    currentDate: Dates.Today(),
                    height: 400,
                    onContentReady: e => this.schedulerOnContentReady(e)
                }
            }
        }
    }

    defineTemplate() {
        return;
        return new Template({
            fillContainer: true,
            orientation: "vertical",
            items: [{
                //name: "scheduler",
                fillContainer: true,
                //                orientation: "vertical",
                backgroundColor: "lightyellow",

            }]
        })
    }

    dataSource(rows) {
        return DsArray({ rows: rows })
    }

    dataSourceOld() {
        if (this._dataSource == undefined) {
            this._dataSource = this.defineDataSource()
        }
        return this._dataSource;
    }

    defineDataSource() {
        return this.defineDataSourceOld()
    }

    defineDataSourceNew() {
        return DsArray({ rows: this.data() })
    }

    defineDataSourceOld() {
        return Ds({
            path: "materias_horas_all",
            filter: {
                añolectivo: this.parameters().añoLectivo,
                curso: this.parameters().curso,
                materiacurso: this.parameters().materiacurso,
            },
            transformData: rows => this.transformData(rows),
            onLoaded: rows => this.components().scheduler.instance().repaint()
        })
    }

    transformRows(rows) {
        return this.transformData(rows);
    }

    transformData(rows) {

        rows.forEach(
            row => this.data.push({
                text: "Hola que tal",
                fechaDesde: this.fechaHora(row.dia, row.desde),
                fechaHasta: this.fechaHora(row.dia, row.hasta)
            })
        )

    }

    fechaHora(day, hour) {
        let date = Dates.DateFromDayOfWeek(Dates.Today(), day);
        return Dates.SetTime(date, hour)
    }

    schedulerOnContentReady(e) {
        const el = this.template().findElementByClass("dx-toolbar-items-container");
        if (el != undefined) {
            //            el.css("display", "none")
        }
        //        this.components().scheduler.instance().repaint()
    }

}