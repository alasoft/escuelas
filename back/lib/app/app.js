const { Http } = require("../utils/http");
const { UsersCreateTable } = require("../users/users");
const { UsersLogged } = require("../users/userslogged");
const { UsersRest } = require("../rest/usersrest");
const { UserStateRest } = require("../rest/userstaterest");
const { Utils, Dates, Files, Properties } = require("../utils/utils");
const { Exception } = require("../utils/exceptions");
const { Path } = require("../utils/path");
const { Obfuscate } = require("../utils/obfuscate");
const { TextBuilder } = require("../utils/textbuilder");
const { Strings } = require("../utils/utils");
const { Postgres } = require("../data/postgres");

class App {

    static TOKEN_MINUTES_DEFAULT = 30;

    constructor(parameters) {
        this.parameters = parameters;
        this.createTablesFunc = parameters.createTables;
        this.restItems = parameters.restItems;
        Properties.SetProperties(this, "back/app/app.json");
        this.db = new Postgres(this.dbProperties())
        this.setPaths()
    }

    dbProperties() {
        const properties = Properties.Load("back/app/db.json");
        properties.app = this;
        return properties;
    }

    setPaths() {

        this.indexRelativePath = "../../../front/app/index.htm";
        this.indexObfRelativePath = "../../../" + this.obfuscatedName() + "/index.htm";

        this.frontRelativePath = "../../../front/app";

        this.staticAlias = "static";
        this.staticRelativePath = "../../../front"
        this.staticRelativeObfPath = "../../../" + this.obfuscatedName()
        this.staticRelativePaths = [
            "app",
            "lib/app",
            "lib/data",
            "lib/template",
            "lib/utils",
            "lib/view",
            "lib/widget",
            "styles"
        ]
    }

    isDemo() {
        return this.demo == true;
    }

    obfuscatedName() {
        return "obfuscated" + (this.isDemo() ? "_demo" : "")
    }

    start() {
        this.init()
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

            this.writeServerParameters();

            if (this.obfuscated == true) {
                this.obfuscate()
            }

            resolve(true)

        })

    }

    writeServerParameters() {
        const destinationFolder = Path.Absolute(this.frontRelativePath)
        const fileName = destinationFolder + "/serverParameters.js";
        Files.DeleteFile(fileName)
        Files.Append(fileName, this.serverParametersContent())
    }

    serverParametersContent() {
        const textBuilder = new TextBuilder();
        textBuilder.add("serverParameters = {")
        textBuilder.add("root: " + Strings.DoubleQuotes(this.root) + ",")
        textBuilder.add("port: " + this.port + ",")
        textBuilder.add("host: " + Strings.DoubleQuotes(this.host))
        textBuilder.add("}")
        return textBuilder.text()
    }

    obfuscate() {
        new Obfuscate({
            relativePaths: {
                front: "../../../front",
                index: "../../../front/app",
                styles: "../../../front/styles",
                destination: "../../../" + this.obfuscatedName()
            }
        }).execute()
    }

    createUsers() {
        return new UsersCreateTable({ app: this }).execute();
    }

    createTables() {
        if (this.createTablesFunc != undefined) {
            return new this.createTablesFunc({ app: this }).execute();
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
        if (this.obfuscated == true) {
            this.buildIndexObf()
        } else {
            this.buildIndexPlain()
        }
    }

    buildIndexObf() {
        const indexPath = Path.Absolute(this.indexObfRelativePath);
        const root = Path.Normalize(this.root);
        this.express.get(root, (req, res) =>
            res.sendFile(indexPath))
    }

    buildIndexPlain() {
        const indexPath = Path.Absolute(this.indexRelativePath);
        const root = Path.Normalize(this.root);
        this.express.get(root, (req, res) =>
            res.sendFile(indexPath))
    }

    useStatic() {
        if (this.obfuscated == true) {
            this.useStaticObf();
        } else {
            this.useStaticPlain()
        }
    }

    useStaticObf() {
        const staticAliasPath = Path.Concatenate(this.static, this.staticAlias);
        const staticPath = Path.Absolute(this.staticRelativeObfPath)
        this.express.use(staticAliasPath, this.expressFunction.static(staticPath));
    }

    useStaticPlain() {
        var staticAliasPath = Path.Concatenate(this.static, this.staticAlias);
        this.staticRelativePaths.forEach(
            relativePath => {
                const staticPath = Path.Absolute(this.staticRelativePath, relativePath);
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
        if (err.stack != undefined) {
            this.log(err.stack)
        }
        res.status(err.status || Http.Internal).send(errDto);
    }

    terminate(err) {
        const errDto = this.errorToDto(err);
        this.log("Error: " + JSON.stringify(errDto));
        if (err.stack != undefined) {
            this.log(err.stack);
        }
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