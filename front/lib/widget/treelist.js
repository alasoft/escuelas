class TreeList extends Widget {

    widgetName() {
        return "dxTreeList";
    }

    defaultConfiguration() {
        return Utils.Merge(
            super.defaultConfiguration(), {
                dataStructure: "plain",
                keyExpr: "id",
                rootValue: null,
                parentIdExpr: "parent",
                autoExpandAll: true,
                showColumnHeaders: false,
            }
        )
    }

    getSelectedRows(mode) {
        return this.instance().getSelectedRowsData(mode);
    }

    dataSource() {
        return this.getProperty("dataSource")
    }

}