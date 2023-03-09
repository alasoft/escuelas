class App extends AppBase {

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
        return "1.0"
    }

    static Host() {
        return "http://127.0.0.1:9090";
    }


}