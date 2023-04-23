class FilterView extends ListView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                filter: {
                    visible: true,
                    labelLocation: "top",
                    items: this.filterItems(),
                },
            },
        })
    }

    filterItems() {}

    filter() {
        return this.components().filter;
    }

    getFilterText(dataField) {
        if (this.filter().isReady()) {
            return this.filter().getEditorText(dataField);
        }
    }

    getFilterValue(dataField) {
        if (this.filter().isReady()) {
            return this.filter().getEditorValue(dataField);
        }
    }

    setFilterValue(dataField, value) {
        this.filter().setEditorValue(dataField, value);
    }

    refreshFilterValue(dataField, value) {
        this.filter().refreshEditorValue(dataField, value);
    }

}

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