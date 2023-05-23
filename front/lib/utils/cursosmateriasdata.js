class CursosMateriasData {

    refresh(añoLectivo) {
        return this.refreshCursosMaterias(añoLectivo)
            .then(data =>
                this.setData(data))
            .then(() =>
                this.transformRows())
    }


    refreshCursosMaterias(añoLectivo) {
        return new Rest({ path: "cursos_materias" })
            .promise({
                verb: "list",
                data: { añolectivo: añoLectivo }
            })
    }

    setData(data) {
        this.periodosRows = data.periodosRows;
        this.cursosMateriasRows = data.cursosMateriasRows;
        this.alumnosCantidadRows = data.alumnosCantidadRows;
        this.examenesCantidadRows = data.examenesCantidadRows;
        this.notasCantidadRows = data.notasCantidadRows;
    }

    transformRows() {
        this.transformPeriodosRows();
        this.transformCursosMateriasRows();
    }

    transformPeriodosRows() {
        for (const row of this.periodosRows) {
            row.desde = new Date(row.desde);
            row.hasta = new Date(row.hasta);
            row.temporalidad = Dates.Temporalidad(row.desde, row.hasta)
        }
    }

    transformCursosMateriasRows() {
        for (const row of this.cursosMateriasRows) {
            row.cursoDescripcion = Cursos.Descripcion(row);
            this.setCursosMateriasRowCantidades(row);
            this.setCursosMateriasRowStatus(row)
        }
    }

    setCursosMateriasRowCantidades(cursoMateriaRow) {
        for (const row of this.periodosRows) {
            cursoMateriaRow["periodo_cantidades_" + row.id] = {
                alumnos: this.alumnosCantidad(cursoMateriaRow.id),
                examenes: this.examenesCantidad(cursoMateriaRow.materiaCurso, row.id),
                notas: this.notasCantidad(cursoMateriaRow.materiaCurso, row.id)
            }
        }
    }

    setCursosMateriasRowStatus(cursoMateriaRow) {
        for (const row of this.periodosRows) {
            cursoMateriaRow["periodo_status_" + row.id] = this.status(cursoMateriaRow["periodo_cantidades_" + row.id], row)
        }
    }

    alumnosCantidad(curso) {
        for (const row of this.alumnosCantidadRows) {
            if (row.curso == curso) {
                return row.count
            }
        }
    }

    examenesCantidad(materiaCurso, periodo) {
        for (const row of this.examenesCantidadRows) {
            if (row.materiaCurso == materiaCurso && row.periodo == periodo) {
                return row.count
            }
        }
    }

    notasCantidad(materiaCurso, periodo) {
        for (const row of this.notasCantidadRows) {
            if (row.materiaCurso == materiaCurso && row.periodo == periodo) {
                return row.count
            }
        }
    }

    status(cantidades, periodoRow) {

        if (Dates.NoEsFuturo(periodoRow.temporalidad)) {
            return ""
        }

        const diferencia = cantidades.alumnos * cantidades.notas - cantidades.notas;
        if (0 < diferencia) {
            if (1 < diferencia) {
                return "Falan cargar " + diferencia + " notas"
            } else {
                return "Falta cargar 1 nota"
            }
        }
        if (diferencia == 0) {
            if (Dates.EsPasado(periodoRow.temporalidad)) {
                return "Completo"
            } else {
                return "Notas al dia"
            }
        }

    }

}