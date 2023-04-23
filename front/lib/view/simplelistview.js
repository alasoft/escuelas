class SimpleListView extends ListView {

    extraConfiguration() {
        return {
            components: {
                list: {
                    toolbar: {
                        items: [this.itemInsert(), this.itemExportExcel(), "searchPanel"]
                    }
                }
            }
        }
    }

    defineTemplate() {
        return new SimpleListViewTemplate();
    }

    refreshToolbar() {}

}

class SimpleListViewTemplate extends Template {

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
                        paddingTop: 5,
                        orientation: "vertical"
                    }]
                },
                {
                    name: "list",
                    fillContainer: true,
                    orientation: "vertical",
                    height: 1
                }, {
                    name: "contextMenu"
                }
            ]
        }
    }

}