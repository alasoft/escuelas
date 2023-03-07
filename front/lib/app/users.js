class Users {

    static GetState(data) {
        return new Rest({ path: "user_state" }).promise({
            verb: "get",
            data: Utils.Merge(data, { user: App.UserId() })
        })
    }

    static SaveState(data) {
        return new Rest({ path: "user_state" }).promise({
            verb: "save",
            data: Utils.Merge(data, { user: App.UserId() })
        })
    }

}