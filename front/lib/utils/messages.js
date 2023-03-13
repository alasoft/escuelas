class Messages {

    static Section(p) {
        return "<b>" + p.title + "<br><br>" + Html.Tab(2) + (p.quotes != false ? Strings.SingleQuotes(p.detail) : p.detail) + "<br><br>";
    }

    static Sections(p) {
        let message = "";
        p.forEach(section => message += this.Section(section));
        return message;
    }

}