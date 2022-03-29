const { Http } = require("../utils/http");
const { UsersCreateTable } = require("../users/users");
const { UsersLogged } = require("../users/userslogged");
const { UsersRest } = require("../rest/usersrest");
const { Dates } = require("../utils/dates");
const { Utils } = require("../utils/utils");
const { Exception } = require("../utils/exceptions");

class App {

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
                this.buildAppRest())
            .then(() =>
                this.useErrorHandler())
            .then(() =>
                this.listen())
            .catch(err =>
                this.log(err)
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
            new this.parameters.createTables({ app: this }).execute();
        }
    }

    buildUsersRest() {
        new UsersRest({ app: this }).build()
    }

    buildAppRest() {
        if (this.parameters.restItems != undefined) {
            for (const item of this.parameters.restItems(this)) {
                item.build()
            }
        }
    }

    useErrorHandler() {
        this.express.use(this.errorHandler.bind(this));
    }

    errorHandler(err, req, res, next) {
        this.sendError(req, res, err);
    }

    sendError(req, res, err) {
        const errDto = this.errorToDto(err);
        this.log("Error: " + JSON.stringify(errDto), req);
        res.status(Http.Internal).send(errDto);
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