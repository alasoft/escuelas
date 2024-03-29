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

    getSelectedRows(mode = "all") {
        return this.instance().getSelectedRowsData(mode);
    }

    getSelectedKeys(mode = "all") {
        return this.instance().getSelectedRowKeys(mode);
    }

    dataSource() {
        return this.getProperty("dataSource")
    }

}