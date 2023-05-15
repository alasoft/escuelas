const { RestBase } = require("../rest/restbase");
const { UsersRegisterService, UsersLoginService, UsersRegisterTestService } = require("../service/usersservice");
const { Utils } = require("../utils/utils");

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
        this.buildVerb("register_test", UsersRegisterTestService)
        this.buildVerb("login", UsersLoginService)
    }
}

module.exports.UsersRest = UsersRest;