const { RestBase } = require("./restbase");
const { UsersRegisterService, UsersLoginService } = require("./userservice");
const { Utils } = require("./utils");

class UsersRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        if (Utils.IsNotDefined(this.path)) {
            this.path = "users";
        }
        this.mustAuthenticate = false;
    }

    build() {
        this.buildVerb("register", UsersRegisterService)
        this.buildVerb("login", UsersLoginService)
    }
}

module.exports.UsersRest = UsersRest;