class List extends Widget {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            keyExpr: "id",
            focusedRowEnabled: true,
            focusedRowIndex: 0,
            allowColumnResizing: true,
            allowColumnReordering: true,
            searchPanel: {
                visible: true,
                searchVisibleColumnsOnly: true
            },
            grouping: {
                autoExpandAll: false,
                contextMenuEnabled: true
            },
            scrolling: {
                mode: "standard"
            },
            editing: {
                confirmDelete: false,
            },
            showBorders: false
        })
    }

    rows() {
        return this.instance().getVisibleRows();
    }

    rowData(rowIndex) {
        return this.rows()[rowIndex].data;
    }

    rowCount() {
        return this.rows().length;
    }

    hasRows() {
        return 0 < this.rowCount();
    }

    isEmpty() {
        return !this.hasRows();
    }

    hasSearchText() {
        return this.getProperty("searchPanel.text") != "";
    }

    focusedRowIndex() {
        return this.getProperty("focusedRowIndex");
    }

    focusedRow() {
        return this.rows()[this.focusedRowIndex()];
    }

    focusedRowData() {
        return this.focusedRow().data;
    }

    id() {
        return this.focusedRowData().id;
    }

    deleteRow(rowIndex) {
        this.instance().deleteRow(rowIndex);
    }

    setDataSource(dataSource) {
        this.setProperty("dataSource", dataSource);
    }

    clearDataSource() {
        this.setDataSource(null);
    }

    dataSource() {
        return this.getProperty("dataSource");
    }

    store() {
        return this.dataSource().store();
    }

    refresh(id) {
        this.instance().refresh().then(
            () =>
            id ? this.focusRowById(id) : undefined
        )
    }

    focusRowById(id) {
        this.setProperty("focusedRowKey", id);
        this.navigateToRow(id);
        this.focus();
    }

    navigateToRow(id) {
        this.instance().navigateToRow(id);
    }

    setToolbarItems(items) {
        if (items != undefined) {
            this.setProperty("toolbar.items", Utils.NoNulls(items));
        }
    }

    selectAll() {
        this.instance().selectAll()
    }

    deselectAll() {
        this.instance().deselectAll()
    }

    selectedRowKeys() {
        return this.instance().getSelectedRowKeys("all");
    }

    insertRow(data) {
        return this.store().insert(data).then(p =>
            this.refresh(data.id)
        )
    }

}

class Column {

    static Id() {
        return {
            dataField: "id",
            visible: false
        }
    }

    static Parent() {
        return {
            dataField: "parent",
            visible: false
        }
    }

    static Text(parameters) {
        return {
            dataField: parameters.dataField,
            caption: parameters.caption,
            width: parameters.width
        }
    }

    static Invisible(parameters) {
        return {
            dataField: parameters.dataField,
            visible: false
        }
    }

    static Calculated(parameters) {
        return {
            calculateCellValue: parameters.formula,
            caption: parameters.caption,
            allowGrouping: true,
            allowSorting: true,
            allowFiltering: true,
            width: parameters.width
        }

    }

    static Date(c) {
        return ({
            dataField: c.dataField,
            dataType: "date",
            format: c.format || App.DATE_FORMAT_DEFAULT,
            caption: c.caption,
            width: c.width
        })
    }


}