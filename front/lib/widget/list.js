class List extends Widget {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            focusedRowEnabled: true,
            focusedRowIndex: 0,
            allowColumnResizing: true,
            allowColumnReordering: true,
            columnsAutoWidth: true,
            showColumnLines: true,
            showBorders: false,
            sorting: {
                mode: "multiple"
            },
            groupPanel: {
                visible: true
            },
            grouping: {
                autoExpandAll: true,
                contextMenuEnabled: true
            },
            searchPanel: {
                visible: true
            },
            editing: {
                confirmDelete: false,
            },
        })
    }

    configuration() {
        const c = super.configuration();
        return c;
    }

    rows() {
        return this.instance().getVisibleRows();
    }

    rowCount() {
        return this.rows().length;
    }

    hasRows() {
        return 0 < this.rowCount();
    }

    rowData(rowIndex) {
        return this.rows()[rowIndex].data;
    }

    rowValue(rowIndex, dataField) {
        return this.rowData(rowIndex)[dataField];
    }

    focusedRowIndex() {
        return this.getProperty("focusedRowIndex");
    }

    focusedRow() {
        return this.rows()[this.focusedRowIndex()];
    }

    focusedRowData() {
        const row = this.focusedRow();
        if (row != undefined) {
            return row.data;
        }
    }

    focusedRowIsData() {
        const row = this.focusedRow();
        return row != undefined && row.rowType == "data";
    }

    focusedRowValue(dataField) {
        return this.focusedRowData()[dataField];
    }

    id() {
        const data = this.focusedRowData();
        if (data != undefined) {
            return data.id;
        }
    }

    firstId() {
        return this.rowData(0).id;
    }

    deleteRow(parameters) {
        return new Rest({ path: parameters.path }).promise({
                verb: "delete",
                data: { id: parameters.id }
            })
            .then(() =>
                this.instance().refresh())
    }

    setDataSource(dataSource) {
        this.setProperty("dataSource", dataSource);
    }

    clearDataSource() {
        this.setDataSource(null);
    }

    getDataSource() {
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

    focusFirstRow(focus = false) {
        this.setProperty("focusedRowIndex", 0);
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
            this.setProperty("toolbar.items", Arrays.NoNulls(items));
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
            this.setColumns(columns);
        } finally {
            this.endUpdate();
        }
    }

    deleteColumns() {
        this.setProperty("columns", [])
    }

    setColumns(columns) {
        this.setProperty("columns", columns)
    }

    getEditColumnName() {
        return this.getProperty("editing.editColumnName");
    }

    cancelEdit() {
        this.instance().cancelEditData()
    }

    isFiltered() {
        return this.instance().getCombinedFilter() != undefined;
    }

    getFilters() {
        return this.instance().getCombinedFilter();
    }

    columnCount() {
        return this.instance().getVisibleColumns().length;
    }

    getState() {
        return this.instance().state();
    }

    setState(state) {
        this.instance().state(state);
        return this;
    }

    collapseAll() {
        this.instance().collapseAll()
    }

    expandAll() {
        this.instance().expandAll()
    }

    hasGroupedColumns() {
        return this.getColumns().find(
            column => this.instance().columnOption(column.dataField, "groupIndex") != undefined
        ) != undefined
    }

    getColumns() {
        return this.getProperty("columns");
    }

    setColumnProperties(dataField, properties) {
        this.instance().columnOption(dataField, properties);
        return this;
    }

}