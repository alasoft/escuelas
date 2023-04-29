const obfuscator = require('javascript-obfuscator');

const { Path } = require("./path")
const { Files, Strings } = require("./utils");
const { Exceptions } = require('./exceptions');

class ObfuscateCompact {

    constructor(parameters) {
        this.parameters = parameters;
        this.fileNames = this.parameters.fileNames;
        this.destinationFile = this.parameters.destinationFile;
        this.relativePaths = this.parameters.relativePaths;
        this.frontFolder = Path.Absolute(this.relativePaths.front);
        this.indexFolder = Path.Absolute(this.relativePaths.index)
        this.stylesFolder = Path.Absolute(this.relativePaths.styles)
        this.destinationFolder = Path.Absolute(this.relativePaths.destination)
    }

    execute() {
        this.checkDestinationFolder();
        this.checkDestinatioFile();
        this.appendFiles();
        this.copyStyles();
        this.copyIndex()
    }

    checkDestinationFolder() {
        Files.CreateFolder(this.destinationFolder)
    }

    checkDestinatioFile() {
        Files.DeleteFile(this.destinationFolder + "/" + this.destinationFile)
    }

    appendFiles() {
        this.fileNames.forEach(fileName => {
            const filePath = this.findFilePath(fileName);
            if (filePath != undefined) {
                const content = Files.Content(filePath);
                Files.Append(this.destinationFolder + "/" + this.destinationFile, content + Strings.LineFeed(2))
            } else {
                throw Exceptions.FileNotFound({ detail: fileName + ".js" })
            }
        })
    }

    findFilePath(fileName) {
        return this.filesPath().find(filePath =>
            Strings.Contains(filePath.toUpperCase(), "\\" + (fileName + ".js").toUpperCase()))
    }

    filesPath() {
        if (this._filesPath == undefined) {
            this._filesPath = this.defineFilesPath()
        }
        return this._filesPath;
    }

    defineFilesPath() {
        return Files.getFilesPath(this.frontFolder, ".js");
    }

    copyStyles() {
        Files.Copy(this.stylesFolder + "/styles.css", this.destinationFolder + "/styles.css")
    }

    copyIndex() {
        Files.Copy(this.indexFolder + "/indexObf.htm", this.destinationFolder + "/index.htm")
    }

}

module.exports.ObfuscateCompact = ObfuscateCompact;