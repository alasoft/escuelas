const path = require('path');
const normalize = require("normalize-path");

class Path {

    static CurrentDir() {
        return process.cwd()
    }

    static SubDir(path) {
        const subDir = normalize(this.CurrentDir() + "/" + path);
        return subDir;
    }

    static Absolute(...relative) {
        return path.join(__dirname, Path.Concatenate(...relative));
    }

    static Normalize(path) {
        const normalized = normalize("/" + path);
        return encodeURI(normalized);
    }

    static Concatenate(...path) {
        return this.Normalize(path.join("/"));
    }

}

module.exports.Path = Path;