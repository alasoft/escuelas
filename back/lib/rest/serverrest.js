const { ServerInfoService } = require("../service/serverservice");
const { RestBase } = require("./restbase");

class ServerRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        this.path = "server";
        this.mustAuthenticate = false;
    }

    build() {
        this.buildVerb("info", ServerInfoService)
    }

}

module.exports.ServerRest = ServerRest;