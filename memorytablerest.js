const { Utils } = require("./utils");
const { MemoryTableListService, MemoryTableGetService } = require("./memorytableservice");
const { RestBase } = require("./restbase");

class MemoryTableRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        this.tableClass = parameters.tableClass;
        if (Utils.IsNotDefined(this.path)) {
            this.path = this.tableClass.ClassName().toLowerCase();
        }
    }

    build() {
        this.buildVerb("list", MemoryTableListService);
        this.buildVerb("get", MemoryTableGetService);
    }

    serviceParameters(req, res) {
        return Utils.Merge(super.serviceParameters(req, res), { table: this.tableClass.Instance() })
    }

}

module.exports.MemoryTableRest = MemoryTableRest;