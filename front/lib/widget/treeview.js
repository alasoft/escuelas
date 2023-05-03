class TreeView extends Widget {

    widgetName() {
        return "dxTreeView";
    }

    defaultConfiguration() {
        return Utils.Merge(
            super.defaultConfiguration(), {
                dataStructure: "plain",
                keyExpr: "id",
                parentIdExpr: "parent",
                selectedExpr: "selected",
                rootValue: null,
                autoExpandAll: true,
                showColumnHeaders: false,
            }
        )
    }

    selectItem(id) {
        this.instance().selectItem(id);
    }

    unselectItem(id) {
        this.instance().unselectItem(id);
    }


}