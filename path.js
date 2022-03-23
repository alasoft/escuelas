const path = require('path');
const normalize = require("normalize-path");

class Path {

    static Absolute(relative) {
        return path.join(__dirname, Path.Normalize(relative));
    }

    static Normalize(path) {
        const normalized = normalize("/" + path);
        return encodeURI(normalized);
    }

    static Concatenate(paths) {
        return this.Normalize(paths.join("/"));
    }

}

module.exports.Path = Path;