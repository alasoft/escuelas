class CursosMateriasData {

    refresh(añoLectivo) {
        this.refreshCursosMaterias()
            .then(() =>
                this.refreshCursosMateriaCount())
    }


    refreshCursosMaterias() {
        return new Rest({ path: "cursos_materias" })
            .promise({
                verb: "list",
                data: { añolectivo: this.añoLectivo }
            })
            .then(rows =>
                this.cursosMateriasRows = rows)
    }

    refreshCursosMateriaCount() {
        return new Rest({ path: "cursos_materias_count" })
            .promise({
                verb: "list",
                data: { añolectivo: this.añoLectivo }
            })
            .then(rows =>
                this.cursosMateriasRows = rows)
    }


}