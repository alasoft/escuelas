const { ServiceBase } = require("./servicebase");

class MemoryTableService extends ServiceBase {

    constructor(parameters) {
        super(parameters);
        this.table = parameters.table;
    }

}

class MemoryTableListService extends MemoryTableService {

    execute() {
        this.sendOkey(this.table.list(this.value("descripcion")));
    }

}

class MemoryTableGetService extends MemoryTableService {

    execute() {
        this.validate().then(() =>
            this.sendOkey(this.table.get(this.value("id"))));
    }

    requiredValues() {
        return "id"
    }

}

module.exports.MemoryTableListService = MemoryTableListService;
module.exports.MemoryTableGetService = MemoryTableGetService;