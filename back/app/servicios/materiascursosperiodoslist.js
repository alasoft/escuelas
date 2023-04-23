const { ServiceBase } = require("../../lib/service/servicebase");
const { MateriasCursosServiceBase } = require("../materiascursosservice");
const { PeriodosServiceBase } = require("../periodosservice");

class MateriasCursosPeriodosList extends ServiceBase {

    execute() {
        this.loadPeriodos()
            .then(() =>
                this.loadMateriasCursos())
            .catch(err =>
                this.sendError(err))
    }

    loadPeriodos() {
        return this.dbSelect(this.sqlSelectPeriodos())
            .then(rows =>
                this.periodosRows = rows)
    }

    sqlSelectPeriodos() {
        return PeriodosServiceBase.sqlList();
    }

    loadMateriasCursos() {
        return this.dbSelect(this.sqlSelectMateriasCursos())
            .then(rows =>
                this.materiasCursosRows = rows)
    }

    sqlSelectMateriasCursos() {
        MateriasCursosServiceBase.sqlListAll();
    }

}