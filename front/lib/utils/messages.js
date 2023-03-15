class Messages {

    static Section(p) {
        if (p != undefined) {
            return "<b>" + p.title + "<br><br>" + Html.Tab(2) + (p.quotes != false ? Strings.SingleQuotes(p.detail) : p.detail) + "<br><br>";
        } else {
            return "";
        }
    }

    static Sections(p) {
        let message = "";
        p.forEach(section => message += this.Section(section));
        return message;
    }

}