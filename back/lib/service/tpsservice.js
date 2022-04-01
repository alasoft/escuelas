const { Utils } = require("../utils/utils");
const { TableListService, TableGetService, TableInsertService, TableUpdateService } = require("./tableservice");

class TpsListService extends TableListService {

    sqlParameters() {
        return Utils.Merge(
            TpsCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: this.sqlAnd()
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("tp.nombre ilike @nombre", { nombre: this.sqlLike(this.value("descripcion")) }))
                .add(this.sqlText("tp.materiacurso=@materiacurso", { materiacurso: this.value("materiacurso") })),
            order: [
                "per.desde",
                "tp.nombre"
            ]
        }
    }
}

class TpsGetService extends TableGetService {

    sqlParameters() {
        return Utils.Merge(
            TpsCommonService.SqlBaseParameters(this),
            this.sqlExtraParameters())
    }

    sqlExtraParameters() {
        return {
            where: "tp.id=@id",
            parameters: { id: this.id() }
        }
    }

}

class TpsInsertService extends TableInsertService {

    requiredValues() {
        return "materiacurso,periodo,nombre,desde,hasta"
    }

    sqlNotDuplicated() {
        return TpsCommonService.SqlNotDuplicated(this);
    }
    duplicatedMessage() {
        return TpsCommonService.DuplicatedMessage();
    }

}

class TpsUpdateService extends TableUpdateService {

    sqlNotDuplicated() {
        return TpsCommonService.SqlNotDuplicated(this);
    }
    duplicatedMessage() {
        return TpsCommonService.DuplicatedMessage();
    }

}


class TpsCommonService {

    static SqlBaseParameters(service) {
        return {
            columns: [
                "tp.id",
                "tp.materiacurso",
                "tp.periodo",
                "tp.nombre",
                "tp.desde",
                "tp.hasta",
                "per.nombre as periodonombre"
            ],
            from: "tps tp",
            joins: [
                { tableName: "periodos", alias: "per", columnName: "tp.periodo" },
            ],
        }
    }

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "tps",
            where: service.sqlAnd([
                "materiacurso=@materiacurso",
                "nombre=@nombre",
            ]),
            parameters: service.jsonValues("materiacurso,nombre")
        })
    }

    static DuplicatedMessage() {
        return "Nombre de Trabajo Práctico duplicado";
    }

}

module.exports.TpsListService = TpsListService;
module.exports.TpsGetService = TpsGetService;
module.exports.TpsInsertService = TpsInsertService;
module.exports.TpsUpdateService = TpsUpdateService;