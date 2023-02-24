const { TableRest } = require("../lib/rest/tablerest");
const {
    AlumnosListService,
    AlumnosGetService,
    AlumnosInsertService,
    AlumnosUpdateService,
    AlumnosDeleteService
} = require("./alumnosservice");

class AlumnosRest extends TableRest {

    getTableName() {
        return "alumnos";
    }

    build() {
        this.buildVerb("list", AlumnosListService);
        this.buildVerb("get", AlumnosGetService);
        this.buildVerb("insert", AlumnosInsertService);
        this.buildVerb("update", AlumnosUpdateService);
        this.buildVerb("delete", AlumnosDeleteService);
    }

}

module.exports.AlumnosRest = AlumnosRest;