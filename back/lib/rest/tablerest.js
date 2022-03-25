const { RestBase } = require("./restbase");
const { Utils } = require("../utils/utils");

class TableRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        this.tableName = parameters.tableName;
        if (Utils.IsNotDefined(this.path)) {
            this.path = this.tableName;
        }
    }

    serviceParameters(req, res) {
        return Utils.Merge(super.serviceParameters(req, res), { tableName: this.tableName })
    }

}

module.exports.TableRest = TableRest;