const { Utils } = require("./utils");

class Messages {

    stati

    static Section(parameters) {

        function title() {
            return "<u>" + parameters.title + "</u><br><br>";
        }

        function line(line) {
            return Utils.HtmlTab() + line + "<br>"
        }

        let section = title();

        parameters.lines.forEach(l =>
            section += line(l));

        return section + "<br><br>";

    }
}

module.exports.Messages = Messages;