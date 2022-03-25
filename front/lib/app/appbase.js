class AppBase {

    static POPUP_PREFFIX_ID = "app-popup";
    static TEMPLATE_TAG_DEFAULT = "<div>";

    static NUMBER_FORMAT_DEFAULT = "######"
    static NUMBER_WIDTH_DEFAULT = 150;

    static CURRENCY_SYMBOL_DEFAULT = "$";
    static MONEY_FORMAT_DEFAULT = this.CURRENCY_SYMBOL_DEFAULT + " ###,###.00"
    static MONEY_WIDTH_DEFAULT = 150;

    static DISPLAY_EXPR_DEFAULT = "nombre";
    static LOOKUP_WIDTH_DEFAULT = 300;

    static DATE_FORMAT_DEFAULT = "dd MMM yyyy";
    static DATE_WIDTH_DEFAULT = 150;

    static POPUP_BACKGROUND_COLOR = "lightsteelblue";

    static CSS_INPUT_DEFAULT = "-font-input";
    static CSS_READ_ONLY_DEFAULT = "-font-readonly";

    static Url(path, verb) {
        return encodeURI(Strings.Concatenate([this.Host(), this.Root(), path, verb], "/"));
    }

    static async Start() {
        this.Localize("es");
        this.Login();
    }

    static Localize(language = "es") {
        DevExpress.localization.locale(language);
    }

    static Login() {
        this.ClearDesktop();
        new Login().render()
            .then(logged => {
                if (logged) {
                    this.ShowDesktop()
                } else {
                    this.Exit()
                }
            });
    }

    static SetUserToken(userToken) {
        sessionStorage.setItem("userToken", JSON.stringify(userToken));
    }

    static GetUserToken() {
        const userToken = sessionStorage.getItem("userToken");
        return userToken != null ? JSON.parse(userToken) : {};
    }

    static Token() {
        return this.GetUserToken().token;
    }

    static UserNombreApellido() {
        const userToken = this.GetUserToken();
        return Utils.Concatenate([userToken.nombre, userToken.apellido])
    }

    static ShowDesktop() {
        this.LoadMemoryTables()
            .then(() =>
                this.ShowAppToolbar())
            .then(() =>
                this.ShowItems())
            .catch(err =>
                this.ShowError(err))
    }

    static LoadMemoryTables() {
        return Utils.EmptyPromise()
    }

    static ShowAppToolbar() {
        this.AppToolbar = new AppToolbar().render();
    }

    static ShowItems() {
        this.AppItems = new AppItems().render();
    }

    static ToggleItems() {
        Utils.ToggleVisibility(this.ItemsElement());
    }

    static Exit() {
        window.location.href = "about:blank";
    }

    static Title(title) {
        return Utils.Concatenate([this.ApplicationFullName(), title], " - ")
    }

    static ApplicationFullName() {
        return this.ApplicationName() + " " + this.ApplicationVersion()
    }

    static ApplicationName() {
        return "Sistema de"
    }

    static ApplicationVersion() {
        return "1.0"
    }

    static ShowError(parameters) {
        return new MessageView(parameters).render();
    }

    static YesNo(parameters) {
        return new YesNoView(parameters).render();
    }

    static AppElement() {
        return $("#app");
    }

    static ToolbarElement() {
        return $("#app-toolbar")
    }

    static ItemsElement() {
        return $("#app-items");
    }

    static ViewElement() {
        return $("#app-view");
    }

    static ElementDefault() {
        return this.ViewElement();
    }

    static BlankViewElement() {
        this.ViewElement().empty();
    }

    static ClearDesktop() {
        this.ToolbarElement().empty();
        this.ItemsElement().empty();
        this.ViewElement().empty();
    }



}