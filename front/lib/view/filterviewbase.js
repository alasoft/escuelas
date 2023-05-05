class FilterViewBase extends ListViewBase {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                filter: {
                    items: this.filterItems(),
                    labelLocation: "top",
                    width: 750
                }
            }
        })
    }

    defineTemplate() {
        return new FilterViewBaseTemplate()
    }

    filter() {
        return this.components().filter;
    }

    getFilterValue(dataField) {
        return this.filter().getValue(dataField);
    }

    getFilterDataSource(dataField) {
        return this.filter().getFilterDataSource(dataField);
    }

    getFilterText(dataField) {
        return this.filter().getEditorText(dataField);
    }

    refreshFilterValue(dataField, value) {
        this.filter().refreshEditorValue(dataField, value);
    }

    setFilterValue(dataField, value) {
        this.filter().setEditorValue(dataField, value)
    }

}

class FilterViewBaseTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.label(),
                this.body(),
            ]
        }
    }

    label() {
        return {
            name: "label",
            marginBottom: App.LABEL_BOTTOM_MARGIN
        }
    }

    body() {
        return {
            fillContainer: true,
            orientation: "vertical",
            padding: App.BOX_PADDING,
            backgroundColor: App.BOX_BACKGROUND_COLOR,
            items: [
                this.filter(),
                this.list(),
                this.contextMenu()
            ]
        }
    }

    filter() {
        return {
            name: "filter",
            orientation: "vertical",
            height: 80
        }
    }

    list() {
        return {
            name: "list",
            fillContainer: true,
            orientation: "vertical",
            height: 1
        }
    }

    contextMenu() {
        return {
            name: "contextMenu"
        }
    }

}