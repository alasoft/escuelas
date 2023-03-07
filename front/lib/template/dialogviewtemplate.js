class DialogViewTemplate extends Template {

    defaultParameters() {
        return Utils.Merge(super.defaultParameters(), {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.toolbar()
            ]
        })
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }

}