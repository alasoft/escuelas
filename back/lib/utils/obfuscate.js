const { Path } = require("./path")
const { Files, Strings } = require("./utils");
const obfuscator = require('javascript-obfuscator');

class Obfuscate {

    static Soft = {}

    static Hard = {
        compact: false,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1
    }

    constructor(parameters) {
        this.parameters = parameters;
        this.destinationFile = this.parameters.destinationFile;
        this.relativePaths = this.parameters.relativePaths;
        this.frontFolder = Path.Absolute(this.relativePaths.front);
        this.indexFolder = Path.Absolute(this.relativePaths.index)
        this.stylesFolder = Path.Absolute(this.relativePaths.styles)
        this.destinationFolder = Path.Absolute(this.relativePaths.destination)
    }

    execute() {
        this.recreateDestinationFolder();
        this.copyFiles();
        this.copyStyles();
        this.copyIndex()
    }

    recreateDestinationFolder() {
        Files.RecreateFolder(this.destinationFolder)
    }

    copyFiles() {
        let fileName;
        let content;
        let obfuscated;
        try {
            this.filesPath().forEach(
                filePath => {
                    fileName = filePath;
                    content = Files.Content(filePath);
                    obfuscated = obfuscator.obfuscate(content, Obfuscate.Soft);
                    Files.Append(this.destinationFolder + "/" + Files.FileName(filePath), obfuscated.getObfuscatedCode())
                }
            )
        } catch (e) {
            console.log(fileName+Strings.LineFeed(2)+content)
            throw e;
        }
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
        Files.Copy(this.indexFolder + "/index.htm", this.destinationFolder + "/index.htm")
    }

}

module.exports.Obfuscate = Obfuscate;