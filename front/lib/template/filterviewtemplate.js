class FilterViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [{
                    name: "label",
                    marginBottom: App.LABEL_BOTTOM_MARGIN
                }, {
                    name: "filter",
                    orientation: "vertical",
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                    padding: 10,
                }, {
                    name: "toolbar",
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                }, {
                    name: "list",
                    fillContainer: true,
                    orientation: "vertical",
                    height: 0
                }, {
                    name: "contextMenu"
                }

            ]
        }
    }

}