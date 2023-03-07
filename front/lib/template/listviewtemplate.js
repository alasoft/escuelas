class ListViewTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [{
                    name: "label",
                    marginBottom: App.LABEL_BOTTOM_MARGIN
                }, {
                    orientation: "vertical",
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                    items: [{
                            name: "filter",
                            padding: App.BOX_PADDING,
                            orientation: "vertical"
                        }

                    ]
                },
                {
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