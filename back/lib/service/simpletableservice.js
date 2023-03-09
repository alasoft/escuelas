const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../service/tableservice");

const { Strings } = require("../utils/utils");
const { Messages } = require("../utils/messages");

class SimpleTableListService extends TableListService {

    sqlParameters() {
        return {
            columns: "id,nombre",
            from: this.tableName,
            where: this.sqlAnd()
                .addIf(
                    this.isDefined("descripcion"), () =>
                    this.sqlText("nombre ilike @nombre", { nombre: this.sqlLike(this.value("descripcion")) })
                ),
            order: "nombre"
        }
    }

}

class SimpleTableGetService extends TableGetService {

    sqlParameters() {
        return {
            columns: "id,nombre",
            from: this.tableName,
            where: "id=@id",
            parameters: { id: this.id() }
        }
    }

}

class SimpleTableInsertService extends TableInsertService {

    sqlNotDuplicated() {
        return SimpleTableCommonService.SqlNotDuplicated(this)
    }

    requiredValues() {
        return "nombre"
    }

    sqlValues() {
        return { nombre: this.value("nombre") }
    }

    duplicatedMessage() {
        return SimpleTableCommonService.DuplicatedMessage(this)
    }

}

class SimpleTableUpdateService extends TableUpdateService {

    sqlNotDuplicated() {
        return SimpleTableCommonService.SqlNotDuplicated(this)
    }

    sqlValues() {
        return { nombre: this.value("nombre") }
    }

    duplicatedMessage() {
        return SimpleTableCommonService.DuplicatedMessage(this)
    }

}

class SimpleTableDeleteService extends TableDeleteService {

}

class SimpleTableCommonService {

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            columns: "id",
            from: service.tableName,
            where: "upper(nombre)=upper(@nombre)",
            parameters: { nombre: service.value("nombre") }
        })
    }

    static DuplicatedMessage(service) {
        return Messages.Section({
            title: service.duplicatedTitle(),
            lines: Strings.SingleQuotes(service.value("nombre"))
        })
    }

}

module.exports.SimpleTableListService = SimpleTableListService;
module.exports.SimpleTableGetService = SimpleTableGetService;
module.exports.SimpleTableInsertService = SimpleTableInsertService;
module.exports.SimpleTableUpdateService = SimpleTableUpdateService;
module.exports.SimpleTableDeleteService = SimpleTableDeleteService;