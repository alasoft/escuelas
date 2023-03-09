const { Utils } = require("./utils");

class Messages {

    static Section(parameters) {

        function title() {
            return (parameters.underLine == true ? "<u>" : "") + parameters.title + "</u><br><br>";
        }

        function line(line) {
            return Utils.HtmlTab(2) + line + "<br>"
        }

        let section = title();

        Utils.ToArray(parameters.lines).forEach(l =>
            section += line(l));

        return section + "<br><br>";

    }
}

module.exports.Messages = Messages;