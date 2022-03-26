class FilterView extends ListView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                filter: {
                    items: this.filterItems(),
                    width: 400,
                    height: 70
                },
            },
        })
    }

    defineTemplate() {
        return Templates.ListWithFilterView();
    }

    filter() {
        return this.components().filter;
    }

    filterItems() {}

    setFilterValue(dataField, value) {
        this.filter().setEditorValue(dataField, value);
    }

    getFilterValue(dataField) {
        return this.filter().getEditorValue(dataField);
    }

}