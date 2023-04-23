const { TableRest } = require("../lib/rest/tablerest");
const {
    ValoracionesListService,
    ValoracionesGetService,
    ValoracionesInsertService,
    ValoracionesUpdateService,
    ValoracionesDeleteService
} = require("./valoracionesservice");

class ValoracionesRest extends TableRest {

    getTableName() {
        return "valoraciones";
    }

    build() {
        this.buildVerb("list", ValoracionesListService);
        this.buildVerb("get", ValoracionesGetService);
        this.buildVerb("insert", ValoracionesInsertService);
        this.buildVerb("update", ValoracionesUpdateService);
        this.buildVerb("delete", ValoracionesDeleteService);
    }

}

module.exports.ValoracionesRest = ValoracionesRest;