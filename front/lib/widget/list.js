class List extends Widget {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
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

    rowValue(rowIndex, dataField) {
        return this.rowData(rowIndex)[dataField];
    }

    hasRows() {
        return 0 < this.rowCount();
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

    focusedRowValue(dataField) {
        return this.focusedRowData()[dataField];
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

    isEmpty() {
        return !this.hasRows();
    }

    hasSearchText() {
        return this.getProperty("searchPanel.text") != "";
    }

    resetColumns(columns) {
        this.beginUpdate();
        try {
            this.deleteColumns();
            this.addColumns(columns);
        } finally {
            this.endUpdate();
        }
    }

    columnCount() {
        return this.instance().columnCount();
    }

    deleteColumns() {
        this.setProperty("columns", [])
    }

    deleteColumn(id) {
        this.instance().deleteColumn(id);
    }

    addColumns(columns) {
        this.beginUpdate();
        try {
            columns.forEach(
                column => this.addColumn(column)
            )
        } finally {
            this.endUpdate()
        }
    }

    addColumn(column) {
        this.instance().addColumn(column);
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

    static Text(p) {
        return {
            dataField: p.dataField,
            caption: p.caption,
            width: p.width,
            allowFiltering: p.filtering != false,
            allowEditing: p.allowEditing == true
        }
    }

    static Invisible(p) {
        return {
            dataField: p.dataField,
            visible: false
        }
    }

    static Calculated(p) {
        return {
            calculateCellValue: p.formula,
            caption: p.caption,
            allowGrouping: true,
            allowSorting: true,
            allowFiltering: p.filtering != false,
            width: p.width
        }

    }

    static Date(p) {
        return ({
            dataField: p.dataField,
            dataType: "date",
            format: p.format || App.DATE_FORMAT_DEFAULT,
            caption: p.caption,
            allowFiltering: p.filtering != false,
            width: p.width
        })
    }


}