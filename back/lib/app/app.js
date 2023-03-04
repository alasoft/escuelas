const { Http } = require("../utils/http");
const { UsersCreateTable } = require("../users/users");
const { UsersLogged } = require("../users/userslogged");
const { UsersRest } = require("../rest/usersrest");
const { UserStateRest } = require("../rest/userstaterest");
const { Dates } = require("../utils/dates");
const { Utils } = require("../utils/utils");
const { Exception } = require("../utils/exceptions");
const { Path } = require("../utils/path");

class App {

    static IndexRelativePath = "../../../front/app/index.htm";

    static StaticAlias = "static";
    static StaticRelativePath = "../../../front"
    static StaticRelativePaths = [
        "app",
        "lib/app",
        "lib/data",
        "lib/template",
        "lib/utils",
        "lib/view",
        "lib/widget",
        "styles"
    ]

    static TOKEN_MINUTES_DEFAULT = 30;

    constructor(parameters) {
        this.parameters = parameters;
        this.port = parameters.port;
        this.root = parameters.root;
        this.tokenMinutes = parameters.tokenMinutes || App.TOKEN_MINUTES_DEFAULT;
    }

    init() {

        return new Promise((resolve, reject) => {

            this.expressFunction = require("express");
            this.express = this.expressFunction();
            this.cors = require("cors");
            this.bodyParser = require("body-parser");

            this.express.use(this.cors());
            this.express.use(this.bodyParser.json({ limit: "50mb" }));
            this.express.use(this.bodyParser.urlencoded({ extended: true, limit: "50mb" }));

            this.usersLogged = new UsersLogged({ app: this });

            resolve(true)

        })

    }

    start() {
        this.init()
            .then(() =>
                this.dbConnect())
            .then(() =>
                this.createUsers())
            .then(() =>
                this.createTables())
            .then(() =>
                this.buildUsersRest())
            .then(() =>
                this.buildUserStateRest())
            .then(() =>
                this.buildAppRest())
            .then(() =>
                this.buildIndex())
            .then(() =>
                this.useStatic())
            .then(() =>
                this.useErrorHandler())
            .then(() =>
                this.listen())
            .catch(err =>
                this.terminate(err)
            )
    }

    dbConnect() {
        if (this.parameters.dbConnection != undefined) {
            this.db = this.parameters.dbConnection(this)
        }
    }

    createUsers() {
        return new UsersCreateTable({ app: this }).execute();
    }

    createTables() {
        if (this.parameters.createTables != undefined) {
            return new this.parameters.createTables({ app: this }).execute();
        }
    }

    buildUsersRest() {
        new UsersRest({ app: this }).build()
    }

    buildUserStateRest() {
        new UserStateRest({ app: this }).build()
    }

    buildAppRest() {
        if (this.parameters.restItems != undefined) {
            for (const item of this.parameters.restItems(this)) {
                item.build()
            }
        }
    }

    buildIndex() {
        const indexPath = Path.Absolute(App.IndexRelativePath);
        const root = Path.Normalize(this.root);
        this.log("GET " + root);
        this.express.get(root, (req, res) =>
            res.sendFile(indexPath))
    }

    useStatic() {
        var staticAliasPath = Path.Concatenate(this.root, App.StaticAlias);
        App.StaticRelativePaths.forEach(
            relativePath => {
                const staticPath = Path.Absolute(App.StaticRelativePath, relativePath);
                this.log("STATIC " + staticPath);
                this.express.use(staticAliasPath, this.expressFunction.static(staticPath))
            }
        )
    }

    useErrorHandler() {
        this.express.use(this.errorHandler.bind(this));
    }

    errorHandler(err, req, res, next) {
        this.sendError(req, res, err);
    }

    sendError(req, res, err) {
        const errDto = this.errorToDto(err);
        this.log("Error: " + JSON.stringify(errDto));
        res.status(err.status || Http.Internal).send(errDto);
    }

    terminate(err) {
        const errDto = this.errorToDto(err);
        this.log("Error: " + JSON.stringify(errDto));
        process.exit();
    }

    errorToDto(err) {
        if (err instanceof Exception) {
            return err
        } else {
            return { message: err.message != undefined ? err.message : "error interno" }
        }
    }

    listen() {
        this.express.listen(this.port)
    }

    newToken(user) {
        return this.usersLogged.newToken(user);
    }

    authenticate(req) {
        this.usersLogged.authenticate(req);
    }

    log(value, req) {
        if (this.parameters.log != false) {
            const date = Dates.Date().toString();
            const user = this.userEmail(req);
            const header = date + " - " + (user != undefined ? user : "Sistema")
            const underline = "-".repeat(header.length);
            Utils.Log([header, underline, value])
        }
    }

    userEmail(req) {
        if (req != undefined && req.user != undefined) {
            return req.user.email
        }
    }

}

module.exports.App = App;