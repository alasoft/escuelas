const fs = require("fs");
const path = require('path');
const { Path } = require("../utils/path")
const { Strings } = require("../utils/utils")

class Obfuscate {

    static frontFolder = Path.Absolute("../../../front");
    static cssFolder = this.frontFolder + "/styles";
    static obfuscatedFolder = Path.Absolute("../../../obfuscated")

    static Execute(obfuscatedFileName) {
        const obfuscatedFile = this.obfuscatedFolder + "/" + obfuscatedFileName;
        if (!fs.existsSync(this.obfuscatedFolder)) {
            fs.mkdirSync(this.obfuscatedFolder);
        }
        if (fs.existsSync(obfuscatedFile)) {
            fs.unlinkSync(obfuscatedFile);
        }
        const filesPath = Files.getFilesPath(this.frontFolder, ".js");
        for (const filePath of filesPath) {
            fs.appendFileSync(obfuscatedFile, fs.readFileSync(filePath).toString() + Strings.LineFeed(2))
        }
        this.CopyIndexObf()
        this.CopyStyles();
    }

    static CopyIndexObf() {
        fs.copyFileSync(this.frontFolder + "/app/indexObf.htm", this.obfuscatedFolder + "/index.htm")
    }

    static CopyStyles() {
        fs.copyFileSync(this.frontFolder + "/styles/styles.css", this.obfuscatedFolder + "/styles.css")
    }

}

module.exports.Obfuscate = Obfuscate;