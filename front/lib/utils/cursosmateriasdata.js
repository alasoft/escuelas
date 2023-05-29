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
        this.valoracionesRows = data.valoracionesRows;
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
            row.temporalidad = Dates.Temporalidad(row.desde, row.hasta);
        }
    }

    transformCursosMateriasRows() {
        for (const row of this.cursosMateriasRows) {
            row.cursoDescripcion = Cursos.Descripcion(row);
            row.alumnosCantidad = this.alumnosCantidad(row.cursoid);
            this.setCursosMateriasRowCantidades(row);
        }
    }

    setCursosMateriasRowCantidades(cursoMateriaRow) {
        for (const row of this.periodosRows) {
            const alumnosCantidad = cursoMateriaRow.alumnosCantidad;
            const examenesCantidad = this.examenesCantidad(cursoMateriaRow.materiacurso, row.id);
            const notasCantidad = this.notasCantidad(cursoMateriaRow.materiacurso, row.id);
            const notasSuma = this.notasSuma(cursoMateriaRow.materiacurso, row.id);
            const promedio = 0 < notasCantidad ? Math.round(notasSuma / notasCantidad) : undefined
            const valoracion = this.valoracion(promedio);
            const status = this.status({
                alumnos: alumnosCantidad,
                examenes: examenesCantidad,
                notas: notasCantidad
            }, row.temporalidad);
            cursoMateriaRow["examenes_cantidad_" + row.id] = examenesCantidad;
            cursoMateriaRow["notas_cantidad_" + row.id] = notasCantidad;
            cursoMateriaRow["promedio_" + row.id] = promedio;
            cursoMateriaRow["valoracion_" + row.id] = valoracion;
            cursoMateriaRow["status_code_" + row.id] = status.code;
            cursoMateriaRow["status_text_" + row.id] = status.text;
        }
    }

    valoracion(promedio) {
        if (promedio != undefined) {
            for (const row of this.valoracionesRows) {
                if (row.desde <= promedio && promedio <= row.hasta) {
                    return row.sigla
                }
            }
        }
    }

    setPromedioValoracionRow(cursoMateriaRow) {
        for (const row of this.periodosRows) {
            const cantidades = cursoMateriaRow["periodo_cantidades_" + row.id];
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
            if (row.materiacurso == materiaCurso && row.periodo == periodo) {
                return row.count
            }
        }
        return 0;
    }

    notasCantidad(materiaCurso, periodo) {
        for (const row of this.notasCantidadRows) {
            if (row.materiacurso == materiaCurso && row.periodo == periodo) {
                return row.count
            }
        }
        return 0;
    }

    notasSuma(materiaCurso, periodo) {
        for (const row of this.notasCantidadRows) {
            if (row.materiacurso == materiaCurso && row.periodo == periodo) {
                return row.sum
            }
        }
        return 0;
    }

    status(cantidades, temporalidad) {

        if (Dates.EsFuturo(temporalidad)) {
            return ""
        }

        if (cantidades.examenes == 0) {
            return { code: CursosMaterias.STATUS_NO_HAY_MATERIAS, text: "No hay Materias dictadas" }
        }

        const diferencia = cantidades.alumnos * cantidades.examenes - cantidades.notas;

        if (0 < diferencia) {
            let text;
            if (1 < diferencia) {
                text = "Faltan cargar " + diferencia + " notas"
            } else {
                text = "Falta cargar 1 nota"
            }
            return { code: CursosMaterias.STATUS_FALTAN_CARGA_NOTAS, text: text }
        }
        if (diferencia == 0) {
            if (Dates.EsPasado(temporalidad)) {
                return { code: CursosMaterias.STATUS_COMPLETO }
            } else {
                return { code: CursosMaterias.STATUS_AL_DIA, text: "Notas al dia" }
            }
        }

    }

}