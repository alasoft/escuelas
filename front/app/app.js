class App extends AppBase {

    static Host() {
        return "http://127.0.0.1:9090";
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