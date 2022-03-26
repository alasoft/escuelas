const { RestBase } = require("./restbase");
const { Utils } = require("../utils/utils");

class TableRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        this.tableName = this.getTableName();
        if (Utils.IsNotDefined(this.path)) {
            this.path = this.tableName;
        }
    }

    getTableName() {
        return this.parameters.tableName;
    }

    serviceParameters(req, res) {
        return Utils.Merge(super.serviceParameters(req, res), { tableName: this.tableName })
    }

}

module.exports.TableRest = TableRest;