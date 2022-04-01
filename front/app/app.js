class App extends AppBase {

    static Host() {
        //        return "http://alasoft.sytes.net:9090";
        return "http://127.0.0.1:9090";
    }

    static Root() {
        return "escuelas";
    }

    static ApplicationVersion() {
        return "0.9.1"
    }

    static ApplicationName() {
        return "Escuelas"
    }

    static LoadMemoryTables() {
        return Años.Load()
            .then(() =>
                Turnos.Load()
            )
    }

}