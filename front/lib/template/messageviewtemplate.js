class MessageViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.message(),
                this.toolbar()
            ]
        }
    }

    message() {
        return {
            name: "message",
            fillContainer: true
        }
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }
}