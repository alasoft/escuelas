const { UserStateGet, UserStateSave } = require("../service/userstateservice");
const { RestBase } = require("./restbase");

class UserStateRest extends RestBase {

    constructor(parameters) {
        super(parameters);
        this.path = "user_state";
    }

    getTableName() {
        return "users_states";
    }

    build() {
        this.buildVerb("save", UserStateSave);
        this.buildVerb("get", UserStateGet)
    }

}

module.exports.UserStateRest = UserStateRest;