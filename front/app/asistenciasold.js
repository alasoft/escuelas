class Asistencias extends ListViewBase {


}

class AsistenciasColumns {

    columns() {
        const columns = this.alumnosColumns().concat(this.periodosColumns());
    }

    alumnosColumns() {
        return [
            {
                dataField: "nombre"
            },
            {
                dataField: "apelllido"
            }
        ]
    }

    periodosColumns() {
        const columns = [];
        for (const periodoRow of this.periodosRows) {
            columns.push(this.periodoColumn(periodoRow))
        }
        return columns;
    }

    periodoColumn(periodoRow) {
        return {
            name: "periodo_" + periodoRow.id,
            caption: periodoRow.nombre,
            columns: this.periodoColumns(periodoRow)
        }
    }

    periodoColumns(periodoRow) {
        const columns = [];
        const meses = Dates.MonthsInRange(periodoRow.desde, periodoRow.hasta);
        for (const mes of meses) {
            columns.push(this.mesColumn(periodoRow, mes))
        }
        return columns;
    }

    mesColumn(periodoRow, mes) {
        return {
            name: "mes_" + mes,
            caption: Dates.MonthName(mes),
            columns: this.mesColumns(periodoRow, mes)
        }
    }

    mesColumns(periodoRow, mes) {
        const columns = []
        for (const horarioRow of this.horariosRows) {
            const horarioFechas = Dates.DatesForDayInMonth(horarioRow.dia, mes, this.añoLectivo);
            for (const horarioFecha of horarioFechas) {
                if (Dates.Between(horarioFecha, periodoRow.desde, periodoRow.hasta)) {
                    columns.push(this.horarioFechaColumn(horarioFecha))
                }
            }
        }
        return columns;
    }

    horarioFechaColumn(horarioFecha) {
        return {
            dataField: "dia_" + Dates.DayMonth(horarioFecha),
            caption: Dates.DayNameOfDate()
        }
    }

}

class AsistenciasRows {

    rows() {

    }

}