const {
    TableListService,
    TableGetService,
    TableInsertService,
    TableUpdateService,
    TableDeleteService
} = require("../lib/service/tableservice");

const { Strings } = require("../lib/utils/utils");
const { Messages } = require("../lib/utils/messages");

class AlumnosListService extends TableListService {

    sqlParameters() {
        return {
            columns: [
                "alu.id",
                "alu.nombre",
                "alu.apellido",
                "alu.genero"
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

    duplicatedMessage() {
        return AlumnosCommonService.DuplicatedMessage(this);
    }

}

class AlumnosUpdateService extends TableUpdateService {

    sqlNotDuplicated() {
        return AlumnosCommonService.SqlNotDuplicated(this);
    }

    duplicatedMessage() {
        return AlumnosCommonService.DuplicatedMessage(this);
    }

}

class AlumnosDeleteService extends TableDeleteService {

}

class AlumnosCommonService {

    static SqlNotDuplicated(service) {
        return service.sqlSelect({
            from: "alumnos",
            where: service.sqlAnd([
                "upper(apellido)=upper(@apellido)",
                "upper(nombre)=upper(@nombre)"
            ]),
            parameters: service.jsonValues("apellido,nombre")
        })
    }

    static DuplicatedMessage(service) {
        return Messages.Section({
            title: "Ya existe un Alumno de nombre",
            lines: Strings.SingleQuotes(Strings.Concatenate([
                service.value("apellido"), service.value("nombre")
            ], ", "))
        })
    }

}

module.exports.AlumnosListService = AlumnosListService;
module.exports.AlumnosGetService = AlumnosGetService
module.exports.AlumnosInsertService = AlumnosInsertService;
module.exports.AlumnosUpdateService = AlumnosUpdateService;
module.exports.AlumnosDeleteService = AlumnosDeleteService;