const { Sql } = require("./sql");
const { TableListService, TableGetService, TableInsertService, TableUpdateService, TableDeleteService } = require("./tableservice");

class SimpleTableListService extends TableListService {

    sqlParameters() {
        return {
            columns: "id,nombre",
            tableName: this.tableName,
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
            tableName: this.tableName,
            where: "id=@id",
            parameters: { id: this.id() }
        }
    }

}

class SimpleTableInsertService extends TableInsertService {

    sqlNotDuplicated() {
        return SimpleTableCommonService.SqlNotDuplicated(this)
    }

}

class SimpleTableUpdateService extends TableUpdateService {

    sqlNotDuplicated() {
        return SimpleTableCommonService.SqlNotDuplicated(this)
    }

}

class SimpleTableDeleteService extends TableDeleteService {

}

class SimpleTableCommonService {

    static SqlNotDuplicated(service) {
        return Sql.Select({
            columns: "id",
            from: service.tableName,
            where: "uppcase(nombre)=uppercase(@nombre)",
            parameter: { nombre: service.value("nombre") }
        })
    }
}

module.exports.SimpleTableListService = SimpleTableListService;
module.exports.SimpleTableGetService = SimpleTableGetService;
module.exports.SimpleTableInsertService = SimpleTableInsertService;
module.exports.SimpleTableUpdateService = SimpleTableUpdateService;
module.exports.SimpleTableDeleteService = SimpleTableDeleteService;