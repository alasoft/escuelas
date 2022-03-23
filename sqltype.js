const { Utils } = require("./utils");

class SqlType {

    static CHAR_SIZE_DEFAULT = 10;
    static VARCHAR_SIZE_DEFAULT = 50;
    static REQUIRED_DEFAULT = true;

    static Pk() {
        return "varchar(38) primary key not null"
    }

    static Fk(parameters) {
        return "varchar(38)" + SqlType.NotNull(parameters);
    }

    static Integer(parameters) {
        return "int" + SqlType.NotNull(parameters);
    }

    static String(parameters = {}) {
        return "varchar(" + (parameters.size || SqlType.VARCHAR_SIZE_DEFAULT) + ")" + SqlType.NotNull(parameters);
    }

    static Char(parameters = {}) {
        return "char(" + (parameters.size || SqlType.CHAR_SIZE_DEFAULT) + ")" + SqlType.NotNull(parameters);
    }

    static Apellido(parameters) {
        return "varchar(25)" + SqlType.NotNull(parameters);
    }

    static Nombre(parameters) {
        return "varchar(25)" + SqlType.NotNull(parameters);
    }

    static UserApellido() {
        return "varchar(25) not null";
    }

    static UserNombre() {
        return "varchar(25) not null";
    }

    static UserEmail() {
        return "varchar(100) not null unique";
    }

    static UserPassword() {
        return "varchar(200) not null";
    }

    static UserRol() {
        return "varchar(50) not null";
    }

    static Tenant() {
        return "varchar(38) not null";
    }

    static Created() {
        return "timestamp not null";
    }

    static Updated() {
        return "timestamp";
    }

    static State() {
        return "int not null";
    }

    static NotNull(parameters = {}) {
        if (Utils.IsNotDefined(parameters.required)) {
            parameters.required = SqlType.REQUIRED_DEFAULT;
        }
        return parameters.required == true ? " not null" : "";
    }

}

module.exports.SqlType = SqlType;