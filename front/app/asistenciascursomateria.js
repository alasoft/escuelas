class AsistenciasCursoMateria extends CursoMateriaViewBase {

    refresh() {
        this.data().refresh()
            .then(() =>
                this.refreshToolbar())
            .then(() =>
                this.refreshColumns())
            .then(() =>
                this.refreshRows())
            .then(() =>
                this.list().focus())
            .catch(err =>
                this.handleError(err))
    }

    defineData() {
        return new AsistenciasCursoMateriaData();
    }

    defineColumns() {

    }

    defineRows() {

    }

}

class AsistenciasCursoMateriaData {

    refresh(añomateriaCurso) {
        return new Rest({ path: "asistencias_cursomateria" })
            .promise({
                verb: "list",
                data: {
                    materiaCurso: this.materiaCurso
                }
            })
            .then(data =>
                this.setData(data))
    }

    setData(data) {

    }


}

class AsistenciasCursoMateriaRows {

    constructor(asistencias) {
        this.data = asistencias.data;
        this.periodos = this.data.periodosRows;
        this.alumnosCantidad = this.data.alumnosCantidad;
        this.horas = this.data.horasRows;
        this.periodos = this.data.periodosRows;
        this.asistenciasFechas = this.data.asistenciasFechasRows;
    }

    rows() {
        return this.horasRows();
    }

    horasRows() {
        const rows = []
        for (const hora of this.horas) {
            rows.concat(this.horaRows(hora))
        }
        return rows;
    }

    horaRows(hora) {
        const rows = []
        for (const periodo of this.periodos) {
            const fechas = Dates.DatesForDayOfWeek(hora.dia, periodo.desde, periodo.hasta);
            for (const fecha of fechas) {
                rows.push(this.horaRow({ hora, periodo, fecha }))
            }

        }
        return rows;
    }

    horaRow(p) {
        const asistenciaFecha = this.findAsistenciaFecha(p);
        return [
            { dia: hora.dia },
            { fecha: fecha },
            { horario: hora.desde + " - " + p.hora.hasta },
            { periodo: periodo.nombre },
            { status: this.status(asistenciaFecha) },
            { asistencia: this.asistencia(p) }
        ]
    }

    status(asistenciaFecha) {
        if (asistenciaFecha != undefined) {
            return Asitencias.Status(this.asistenciasFecha.status)
        }
    }

    asistencia(asistenciaFecha) {
        if (asistenciaFecha != undefined) {
            return Math.round(asistenciaFecha.inasistencias * 100 / this.alumnosCantidad) + " %"
        } else {
            return ""
        }
    }

    findAsistenciaFecha(p) {
        for (const asistenciaFecha of this.asistenciasFechas) {
            if (asistenciaFecha.hora == p.hora.id && asistenciaFecha.fecha == p.fecha) {
                return asistenciaFecha;
            }
        }
    }

}