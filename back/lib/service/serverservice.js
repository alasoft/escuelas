const { ServiceBase } = require("./servicebase");

class ServerInfoService extends ServiceBase {

    execute() {
        this.sendOkey(this.data())
    }

    data() {
        return {
            name: this.app.name,
            version: this.app.version,
            demo: this.app.demo,
            demoMaxAlumnos: this.app.demoMaxAlumnos
        }
    }

}

module.exports.ServerInfoService = ServerInfoService;