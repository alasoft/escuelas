class EntryViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.form(),
                this.toolbar()
            ]
        }
    }

    form() {
        return {
            name: "form",
            margin: 10,
            fillContainer: true,
            orientation: "vertical"
        }
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }

}