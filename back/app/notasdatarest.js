const { RestBase } = require("../lib/rest/restbase");
const { Utils } = require("../lib/utils/utils");
const { NotasDataListService } = require("./notasdataservice");

class NotasDataRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        if (Utils.IsNotDefined(this.path)) {
            this.path = "notas_data";
        }
    }

    build() {
        this.buildVerb("list", NotasDataListService);
    }

}

module.exports.NotasDataRest = NotasDataRest;