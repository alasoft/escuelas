class App extends AppBase {

    static TableNames = new Map()
        .set("materias_cursos", "Materias Dictadas (de Cursos)")
        .set("tps", "Trabajos Prácticos")

    static DefineViewNormal() {
        return new AppView();
    }

    static Root() {
        return "escuelas"
    }

    static LoadMemoryTables() {
        return Años.Load()
            .then(() =>
                Turnos.Load()
            )
    }

    static Name() {
        return "Sistema de Escuelas";
    }

    static Version() {
        return "0.0"
    }

    static Host() {
        //return "http://alasoft.sytes.net:9090";
        return "http://127.0.0.1:9090"
    }

    static TranslateTableName(name) {
        let translate = this.TableNames.get(name.trim().toLowerCase());
        if (translate != undefined) {
            return translate;
        } else {
            return Strings.Capitalize(name);
        }

    }

}