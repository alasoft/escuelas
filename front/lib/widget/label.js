class Label extends Component {

    render() {
        if (this.configuration().visible != false) {
            this.setText(this.configuration().text)
        }
    }

    setText(text) {
        this.element().text(text)
    }

    setVisible(visible) {
        this.element().hide();
    }

}