const { Path } = require("../utils/path");
const { Utils } = require("../utils/utils");

class RestBase {

    constructor(parameters) {
        this.parameters = parameters;
        this.app = parameters.app;
        this.path = parameters.path;
        this.express = this.app.express;
        this.mustAuthenticate = true;
    }

    buildVerb(verb, serviceClass) {
        const verbPath = this.verbPath(verb);
        //        this.app.log("POST " + verbPath)
        this.express.post(verbPath, this.authenticate.bind(this), (req, res) => {
            new serviceClass(this.serviceParameters(req, res)).execute()
        })
    }

    verbPath(verb) {
        return Path.Concatenate(this.app.root, this.path, verb)
    }

    authenticate(req, res, next) {
        if (this.mustAuthenticate) {
            this.app.authenticate(req);
        }
        next();
    }

    serviceParameters(req, res) {
        return Utils.Merge(this.parameters, { req, res });
    }

}

module.exports.RestBase = RestBase