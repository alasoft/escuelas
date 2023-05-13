class App extends AppBase {

    static TableNames = new Map()
        .set("materias_cursos", "Materias Dictadas (de Cursos)")
        .set("examenes", "Examenes")

    static DefineViewNormal() {
        return new AppView();
    }

    static LoadMemoryTables() {
        return Años.Load()
            .then(() =>
                Turnos.Load()
            )
            .then(() =>
                ExamenesTipos.Load()
            )
            .then(() =>
                PeriodosEstados.Load()
            )
    }

    static TranslateTableName(name) {
        let translate = this.TableNames.get(name.trim().toLowerCase());
        if (translate != undefined) {
            return translate;
        } else {
            return Strings.Capitalize(name);
        }
    }

    static Root() {
        return "escuelas";
    }

    static ShowPresentation() {
        if (this.IsDemo() == true) {
            return this.ShowMessage([{
                message: "Esta es la versión demostrativa del Sistema de Escuelas " + this.Version(),
                skipSection: 0
            },
            {
                message: Html.Tab(2) + "Ingrese con su Usuario o bien registrese.<br>",
                lineFeed: 0
            }, {
                lineFeed: 0,
                message: Html.Tab(2) + "Usted podrá probarlo inmediatamente con datos pre cargados,<br>"+
                Html.Tab(2)+"que facilitan su uso"
            }])
        }
    }


}