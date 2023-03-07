const { TableRest } = require("../lib/rest/tablerest");

const {
    MateriasDiasListService,
    MateriasDiasGetService,
    MateriasDiasInsertService,
    MateriasDiasUpdateService,
    MateriasDiasDeleteService
} = require("./MateriasDiasservice");

class MateriasDiasRest extends TableRest {

    getTableName() {
        return "materias_dias";
    }

    build() {
        this.buildVerb("list", MateriasDiasListService);
        this.buildVerb("get", MateriasDiasGetService);
        this.buildVerb("insert", MateriasDiasInsertService);
        this.buildVerb("update", MateriasDiasUpdateService);
        this.buildVerb("delete", MateriasDiasDeleteService);
    }

}

module.exports.MateriasDiasRest = MateriasDiasRest;