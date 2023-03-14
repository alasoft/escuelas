const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");

class AlumnosListService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "alu.id",
                "alu.nombre",
                "alu.apellido",
                "alu.genero",
                "alu.email"
            ],
            from: "alumnos alu",
            where: this.sqlAnd()
                .addIf(this.isDefined("curso"), () =>
                    this.sqlText("alu.curso=@curso", {
                        curso: this.value("curso")
                    }))
                .addIf(this.isDefined("descripcion"), () =>
                    this.sqlText("alu.nombre || alu.apellido ilike @descripcion", {
                        descripcion: this.value("descripcion")
                    })
                ),
            order: "alu.apellido,alu.nombre"
        }
    }

}

class AlumnosGetService extends TableGetService {

    sqlParameters() {
        return {
            columns: [
                "alu.id",
                "alu.nombre",
                "alu.apellido",
                "alu.genero"
            ],
            from: "alumnos alu",
            where: "id=@id",
            parameters: { id: this.id() }
        }
    }

}

class AlumnosInsertService extends TableInsertService {

    requiredValues() {
        return "curso,apellido,nombre"
    }

    sqlNotDuplicated() {
        return AlumnosCommonService.SqlNotDuplicated(this);
    }

}

class AlumnosUpdateService extends TableUpdateService {

    sqlNotDuplicated() {
        return AlumnosCommonService.SqlNotDuplicated(this);
    }

}

class AlumnosDeleteService extends TableDeleteService {

}

class AlumnosCommonService {

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "alumnos",
            where: service.sqlAnd([
                "curso=@curso",
                "upper(apellido)=upper(@apellido)",
                "upper(nombre)=upper(@nombre)"
            ]),
            parameters: service.jsonValues("curso,apellido,nombre")
        })
    }

}

module.exports.AlumnosListService = AlumnosListService;
module.exports.AlumnosGetService = AlumnosGetService
module.exports.AlumnosInsertService = AlumnosInsertService;
module.exports.AlumnosUpdateService = AlumnosUpdateService;
module.exports.AlumnosDeleteService = AlumnosDeleteService;