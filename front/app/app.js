class App extends AppBase {

    static Host() {
        return "http://alasoft.sytes.net:9090";
    }

    static Root() {
        return "escuelas";
    }

    static ApplicationName() {
        return "Sistema de Escuelas"
    }

    static LoadMemoryTables() {
        return Años.Load()
            .then(() =>
                Turnos.Load()
            )
    }

}