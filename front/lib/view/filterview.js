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

    filterItems() { }

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
            return this.filter().getValue(dataField);
        }
    }

    setFilterValue(dataField, value) {
        this.filter().setEditorValue(dataField, value);
    }

    refreshFilterValue(dataField, value) {
        this.filter().refreshEditorValue(dataField, value);
    }

}