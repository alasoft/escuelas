class List extends Widget {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            focusedRowEnabled: true,
            focusedRowIndex: 0,
            hoverStateEnabled: true,
            allowColumnResizing: true,
            allowColumnReordering: true,
            //            columnsAutoWidth: true,
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
            },
            searchPanel: {
                visible: true
            },
            editing: {
                confirmDelete: false,
            },
            pager: {
                visible: false,
                showInfo: true,
                showNavigationButtons: true,
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
        const data = this.focusedRowData();
        if (data != undefined) {
            return data[dataField];
        }
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

    setArrayDataSource(rows) {
        this.setDataSource(DsArray({ rows: rows }))
    }

    clearDataSource() {
        this.setDataSource(null);
    }

    dataSource() {
        return this.getProperty("dataSource");
    }

    dataRows() {
        return this.dataSource().items()
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

    updateRow(id, data) {
        var rowIndex = this.rowIndexById(id);
        this.beginUpdate();
        try {
            Object.keys(data).forEach(
                key => this.instance().cellValue(rowIndex, key, data[key])
            )
        } finally {
            this.endUpdate();
        }
    }

    rowIndexById(id) {
        return this.instance().getRowIndexByKey(id);
    }

    focusNextRow() {
        if (this.hasNextRow()) {
            this.focusRowByIndex(this.focusedRowIndex() + 1);
            return true;
        }
        return false;
    }

    focusPriorRow() {
        if (this.hasPriorRow()) {
            this.focusRowByIndex(this.focusedRowIndex() - 1);
            return true;
        }
        return false;
    }

    hasNextRow() {
        return this.focusedRowIndex() < this.rowCount() - 1;
    }

    hasPriorRow() {
        return (0 < this.focusedRowIndex());
    }

    focusRowByIndex(rowIndex) {
        this.setProperty("focusedRowIndex", rowIndex);
    }

    hasNextRow() {
        return this.focusedRowIndex() < this.rowCount() - 1;
    }

    isEditing() {
        return this.instance().hasEditData();
    }

    saveEdit() {
        return this.instance().saveEditData();
    }

    cancelEdit() {
        return this.instance().cancelEditData();
    }

    showSummary(show = true) {
        this.setProperty("summary.visible", false)
    }

    setColumnProperty(name, propertyName, value) {
        this.instance().columnOption(name, propertyName, value);
    }

    getColumnProperty(name, propertyName) {
        return this.instance().columnOption(name, propertyName);
    }

    showColumn(name, visible = true) {
        this.setColumnProperty(name, "visible", visible)
    }

    toggleColumnVisibility(name) {
        const visible = this.getColumnProperty(name, "visible");
        this.setColumnProperty(name, "visible", !visible);
        return !visible;
    }

    isColumnVisible(name) {
        return this.getColumnProperty(name, "visible");
    }

    setColumnsVisibility(visibility) {
        if (visibility != undefined) {
            this.beginUpdate();
            try {
                Object.keys(visibility).forEach(
                    key => this.showColumn(key, visibility[key])
                )
            } finally {
                this.endUpdate()
            }
        }
    }

    getColumnsVisibility() {
        const visibility = {}
        this.getColumns().forEach(column =>
            visibility[column.name] = this.isColumnVisible(column.name)
        )
        return visibility;
    }

}