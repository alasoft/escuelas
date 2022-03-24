class AppObject {

    constructor(parameters) {
        super(parameters);
        this.app = parameters.app;
        this.db = this.app.db;
    }

}