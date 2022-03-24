const { Http } = require("./http");
const { UsersCreateTable } = require("./users");
const { UsersLogged } = require("./userslogged");
const { UsersRest } = require("./usersrest");

class App {

    static TOKEN_ALIVE_DEFAULT = 30;

    constructor(parameters) {
        this.parameters = parameters;
        this.port = parameters.port;
        this.root = parameters.root;
        this.tokenAlive = parameters.tokenAlive || App.TOKEN_ALIVE_DEFAULT;
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
                console.log(err))
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
        this.sendError(res, err);
    }

    sendError(res, err) {
        if (err instanceof Error) {
            err = {
                status: Http.Internal,
                message: err.message
            }
        }
        console.log(err.stack);
        console.log(err);
        res.status(err.status).send(err);
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

}

module.exports.App = App;