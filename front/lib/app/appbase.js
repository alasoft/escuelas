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

    static SingletonClasses = [];

    static Url(path, verb) {
        return encodeURI(Utils.Concatenate([this.Host(), this.Root(), path, verb], "/"));
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

    static ClearDesktop() {
        this.EmptySingletones();
        this.ToolbarElement().empty();
        this.ItemsElement().empty();
        this.ViewElement().empty();
    }

    static EmptySingletones() {
        this.SingletonClasses.forEach(
            SingletonClass => SingletonClass.BlankSingleton()
        )
    }

    static AddSingletonClass(singletonClass) {
        this.SingletonClasses.push(singletonClass);
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

    static SetUser(user) {
        sessionStorage.setItem("user", JSON.stringify(user));
    }

    static GetUser() {
        const user = sessionStorage.getItem("user");
        return user != null ? JSON.parse(user) : {};
    }

    static Token() {
        return this.GetUser().token;
    }

    static UserNombreApellido() {
        const user = this.GetUser();
        return Utils.Concatenate([user.nombre, user.apellido])
    }

    static ToggleItems() {
        Utils.ToggleVisibility(this.ItemsElement());
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

    static ShowMessage(parameters) {
        return new MessageView(parameters).render()
    }

    static ShowError(parameters) {
        return new ErrorView(parameters).render();
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

    static Exit() {
        window.location.href = "about:blank";
    }

}