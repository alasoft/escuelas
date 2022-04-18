class FilterView extends ListView {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                filter: {
                    items: this.filterItems(),
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

    filterSetValue(dataField, value) {
        this.filter().setEditorValue(dataField, value);
    }

    filterValue(dataField) {
        return this.filter().getEditorValue(dataField);
    }

    filterText(dataField) {
        return this.filter().getEditorText(dataField);
    }

}