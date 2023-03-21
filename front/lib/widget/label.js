class Label extends Component {

    render() {
        if (this.configuration().visible != false) {
            this.setText(this.configuration().text)
            if (this.configuration().styles != undefined) {
                this.setStyles(this.configuration().styles)
            }
        }
    }

    setText(text) {
        this.element().text(text);
    }

    setHtml(html) {
        this.element().html(html)
    }

    setStyles(styles) {
        this.element().css(styles)
    }

    setVisible(visible) {
        this.element().hide();
    }

}