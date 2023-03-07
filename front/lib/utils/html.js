class Html {

    static IsVisible(element) {
        return element.css("display") != "none";
    }

    static ToggleVisibility(element, cssVisible = "flex") {
        const isVisible = element.css("display") != "none";
        element.css("display", isVisible ? "none" : cssVisible);
        return !isVisible;
    }

    static Hide(element) {
        element.css("display", "none");
    }

    static Lines(lines) {
        let text = "";
        lines.forEach(
            (line, i) => text += (0 < i ? "<br>" : "") + (Utils.IsDefined(line) ? line : "")
        )
        return text;
    }

    static UnderlineTitle(title, plus = 7) {
        return title + "<br>" + "-".repeat(title.length + plus);
    }

    static Tab(n = 1) {
        return "&emsp;".repeat(n);
    }

    static Bold() {
        return "<b>";
    }

    static BoldWithStyle(style) {
        return '<b style="' + style + '">';
    }

    static LineFeed(n = 1) {
        return "<br>".repeat(n);
    }

    static Italic() {
        return "<i>";
    }

}