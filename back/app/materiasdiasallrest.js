const { TableRest } = require("../lib/rest/tablerest");
const { MateriasDiasListAllService } = require("./materiasdiasallservice");
const { MateriasDiasGetService } = require("./materiasdiasservice")

class MateriasDiasAllRest extends TableRest {

    getTableName() {
        return "materias_dias";
    }

    build() {
        this.buildVerb("list", MateriasDiasListAllService);
        this.buildVerb("get", MateriasDiasGetService);
    }

}

module.exports.MateriasDiasAllRest = MateriasDiasAllRest;