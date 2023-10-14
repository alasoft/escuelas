class FilterViewBase extends ListViewBase {

    defineTemplate() {
        return new FilterViewBaseTemplate()
    }

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

    filterValueDefined(dataField) {
        return Utils.IsDefined(this.getFilterValue(dataField));
    }

    emptyState() {
        return { list: {}, filter: {} }
    }


}

class FilterViewBaseTemplate extends ListViewBaseTemplate {

    bodyItems() {
        return [this.filter()].concat(super.bodyItems())
    }

    filter() {
        return {
            name: "filter",
            orientation: "vertical",
            height: 80
        }
    }

}