class AppBase {

    static APP_NAME = "app";
    static TITLE_NAME = "appTitle";
    static BODY_NAME = "appBody";
    static TOOLBAR_NAME = "appToolbar";
    static ITEMS_RESIZER_NAME = "appItemsResizer";
    static ITEMS_NAME = "appItems";
    static VIEW_NAME = "appView";

    static BOX_BACKGROUND_COLOR = "white";
    static BOX_MARGIN = 7;
    static BOX_PADDING = 10;
    static LABEL_BOTTOM_MARGIN = 3;
    static ITEMS_WIDTH = 250;

    static FONT_INPUT = "font-input";
    static FONT_READ_ONLY = "font-read-only";

    static NUMBER_FORMAT = "######"
    static NUMBER_WIDTH = 150;

    static DATE_FORMAT = "dd MMM yyyy"
    static DATE_FORMAT_LONG = "dd MMM yyyy, EEE"

    static DATE_COLUMN_WIDTH = 200;
    static DATE_WIDTH = 150;
    static DATE_WIDTH_LONG = 180;

    static TIME_FORMAT = "HH:mm"
    static TIME_FORMAT_SHORT = "HH:mm"

    static TIME_WIDTH = 100;

    static EMAIL_WIDTH = 400;

    static POPUP_BACKGROUND_COLOR = "white";
    static POPUP_PREFFIX_ID = "appPopup";

    static KEY_NAME = "id";

    static FILTER_HEIGHT = 70;

    static DISPLAY_EXPR = "nombre";

    static MESSAGE_TITLE = "Atención"
    static VALIDATION_MESSAGE_TITLE = "Atención"
    static ERROR_MESSAGE_TITLE = "Error"
    static INTERNAL_ERROR_MESSAGE_TITLE = "Error Interno"

    static UNIDENTIFIED_ERROR_MESSAGE = "Ha ocurrido un error";

    static ZONA_HORARIA_ARGENTINA = "America/Argentina/Buenos_Aires";
    static BASE_DATE = "1900 01 01";

    static CLIENT_DESCRIPTION_HEADER = "client_description"

    static USER_TEST_DATA = {
        email: "test@test.com",
        password: "test"
    }

    static Init() {
        return this.Localize()
            .then(() =>
                this.Login())
    }

    static InitUser(user) {
        return this.Localize()
            .then(() =>
                this.LoginUser(user));
    }

    static InitUserTest() {
        return this.InitUser(this.USER_TEST_DATA);
    }

    static InitTest() {
        return this.BeginTest()
            .then(() =>
                this.Localize())
            .then(() =>
                this.LoginUser(this.USER_TEST_DATA))
    }

    static BeginTest() {
        return Promise.resolve(this._IsTesting = true);
    }

    static IsTesting() {
        return this._IsTesting == true;
    }

    static Localize(language = "es") {
        return Promise.resolve(DevExpress.localization.locale(language));
    }

    static Login() {
        return this.ClearSession()
            .then(() =>
                this.LoginUserView())
            .then(closeData =>
                this.AfterLogin(closeData))
    }

    static LoginUser(data) {
        return this.ClearSession()
            .then(() =>
                this.LoginUserRest(data))
            .then(closeData =>
                this.AfterLogin(closeData))
    }

    static ClearSession() {
        return Promise.resolve(this.ClearUser())
            .then(() =>
                this.ClearDataSources())
            .then(() =>
                $("body").empty());
    }

    static LoginUserView() {
        return new LoginView().render();
    }

    static LoginUserRest(data) {
        return new Rest({ path: "users" }).promise({
                verb: "login",
                data: data
            })
            .then(user =>
                App.SetUser(user))
            .then(() => {
                return { okey: true }
            })
    }

    static AfterLogin(closeData) {
        if (closeData.okey) {
            return this.LoadMemoryTables().then(() =>
                this.ReloadView())
        } else {
            return this.Exit()
        }
    }

    static LoadMemoryTables() {
        return Promise.resolve();
    }

    static View() {
        if (this._View == undefined) {
            this._View = this.DefineView()
        }
        return this._View;
    }

    static DefineView() {
        if (this.IsTesting()) {
            return this.ViewTest()
        } else {
            return this.ViewNormal()
        }
    }

    static ViewNormal() {
        if (this._ViewNormal == undefined) {
            this._ViewNormal = this.DefineViewNormal()
        }
        return this._ViewNormal;
    }

    static ViewTest() {
        if (this._ViewTest == undefined) {
            this._ViewTest = this.DefineViewTest()
        }
        return this._ViewTest;
    }

    static DefineViewNormal() {
        return new AppViewBase();
    }

    static DefineViewTest() {
        return new AppViewTest();
    }

    static ReloadView() {
        this._View = undefined;
        this._ViewNormal = undefined;
        this._ViewTest = undefined;
        this.View().render();
    }

    static AppElement() {
        return this.View().findElementByClass(this.APP_NAME);
    }

    static TitleElement() {
        return this.View().findElementByClass(this.TITLE_NAME);
    }

    static ItemsResizerElement() {
        return this.View().findElementByClass(this.ITEMS_RESIZER_NAME)
    }

    static ItemsElement() {
        return this.View().findElementByClass(this.ITEMS_NAME)
    }

    static ViewElement() {
        return this.View().findElementByClass(this.VIEW_NAME)
    }

    static BlankViewElement() {
        this.ViewElement().empty();
    }

    static ToggleItems() {
        Html.ToggleVisibility(this.ItemsResizerElement())
    }

    static HideItems() {
        Html.Hide(this.ItemsResizerElement())
    }

    static ItemsAreHide() {
        return !Html.IsVisible(this.ItemsResizerElement());
    }

    static Url(path, verb) {
        return encodeURI(Strings.Concatenate([this.Host(), this.Root(), path, verb], "/"));
    }

    static Host() {
        return "http://127.0.0.1:9090";
    }

    static Root() {
        return "test"
    }

    static GetUser() {
        const json = sessionStorage.getItem("user");
        const user = JSON.parse(json);
        return user != null ? user : {};
    }

    static GetToken() {
        return this.GetUser().token;
    }

    static SetUser(user) {
        sessionStorage.setItem("user", JSON.stringify(user));
    }

    static ClearUser() {
        this.SetUser(null);
    }

    static ShowMessage(p1, p2) {
        return new MessageView(Utils.Merge({ message: Messages.Build(p1) }, p2)).render();
    }

    static ShowError(parameters) {
        return new ErrorView(parameters).render();
    }

    static YesNo(parameters) {
        return new YesNoView(parameters).render();
    }

    static Exit() {
        window.location.href = "about:blank";
    }

    static Title(title) {
        return Strings.Concatenate([this.FullName(), title], " - ")
    }

    static Name() {
        return "Sistema de "
    }

    static ShortName() {
        return this.Name() + " " + this.Version()
    }

    static FullName() {
        return "Sistema de " + this.ShortName();
    }

    static Version() {
        return "0.0"
    }

    static UserNombreApellido() {
        const user = this.GetUser();
        return Strings.Concatenate([user.nombre, user.apellido])
    }

    static UserId() {
        return this.GetUser().id;
    }

    static SelectFirstItem() {
        this.View().selectFirstItem();
    }

    static RegisterDataSource(viewClass, parameters) {
        const dataSource = Ds(parameters);
        this.DataSources().set(viewClass, dataSource);
        return dataSource;
    }

    static DataSources() {
        if (this._DataSources == undefined) {
            this._DataSources = new Map();
        }
        return this._DataSources;
    }

    static ClearDataSources() {
        this.DataSources().forEach((dataSource, viewClass) =>
            viewClass.ClearDataSource())
    }

}