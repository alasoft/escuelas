class AppTest extends App {

    static UserTest = { email: "test@test.com", password: "test" };

    static Start() {
        this.Localize("es");
        this.LoginUserTest();
    }

    static LoginUserTest() {
        return new Rest({ path: "users" }).do("login", this.UserTest)
            .then(userToken =>
                this.SetUserToken(userToken))
            .then(() =>
                this.ShowDesktop())
            .catch(err =>
                this.ShowError(err).then(err =>
                    this.Exit()))
    }

}