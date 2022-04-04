const { Exceptions } = require("../utils/exceptions");
const { Utils } = require("../utils/utils");

class SqlType {

    static CHAR_SIZE_DEFAULT = 10;
    static VARCHAR_SIZE_DEFAULT = 50;
    static REQUIRED_DEFAULT = true;

    static Pk() {
        return "varchar(38) primary key not null"
    }

    static Fk(parameters) {
        if (Utils.IsNotDefined(parameters.references)) {
            throw Exceptions.ForeignKeyReferenceNotDefined({ message: "Foreign Key Field without reference Table" })
        }
        return "varchar(38) references " + parameters.references + "(id)" + this.NotNull(parameters);
    }

    static Integer(parameters) {
        return "int" + this.NotNull(parameters);
    }

    static String(parameters = {}) {
        return "varchar(" + (parameters.size || SqlType.VARCHAR_SIZE_DEFAULT) + ")" + this.NotNull(parameters);
    }

    static Char(parameters = {}) {
        return "char(" + (parameters.size || SqlType.CHAR_SIZE_DEFAULT) + ")" + this.NotNull(parameters);
    }

    static Date(parameters = {}) {
        return "date" + this.NotNull(parameters);
    }

    static Apellido(parameters) {
        return "varchar(25)" + this.NotNull(parameters);
    }

    static Nombre(parameters) {
        return "varchar(25)" + this.NotNull(parameters);
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