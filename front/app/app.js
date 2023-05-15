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
                message: "Esta es la versión de Prueba del Sistema de Escuelas " + this.Version(),
                lineFeed: 0
            },
            {
                message: Html.Tab(4) + "<i>Ingrese con su Usuario, o en caso de no tenerlo regístrese.</i>",
                lineFeed: 1
            }, {
                message: "Usted podrá probarlo inmediatamente, ya que viene con datos pre-cargados,<br>" +
                    "que facilitan su uso.",
                lineFeed: 0,
            },
            {
                message: Html.Tab(4) + "<i>Podrá agregar, modificar y borrar datos a voluntad. También podrá exportar<br>" +
                    Html.Tab(4) + "las planillas de notas a Excel.</i>",
                lineFeed: 1
            },
            {
                message: "Por ser una versión de Prueba contiene dos limitaciones:",
                lineFeed: 0,
            },
            {
                message: Html.Tab(4) + "<i>Permite manejar hasta " + App.ServerInfo.demoMaxAlumnos + " alumnos y los datos serán borrados<br>" +
                    Html.Tab(4) + "en 10 dias</i>",
                lineFeed: 1,
            },
            {
                message: "El objetivo de este Sistema ?",
                lineFeed: 0,
            },
            {
                lineFeed: 0,
                message: Html.Tab(4) + "<i>Pasar de calcular promedios, valoraciones, totalizar por períodos y <br>" +
                    Html.Tab(4) + "controlar alumnos .. de dias a horas"
            }], { height: 550 })
        }
    }

    static DemoWellcomeMessage() {
        return [
            { message: "Bienvenido a la versión Demo del " + this.ShortName(false), lineFeed: 1 },
            { message: "<u>Recuerde:</u>", detail: "<i>Hay datos pre cargados para que Ud pueda probar<br>" + Html.Tab(2) + "rápidamente este Sistema</i>", quotes: false }
        ]
    }


}