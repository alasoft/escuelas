class TreeView extends Widget {

    static ROOT_VALUE = null;

    widgetName() {
        return "dxTreeView";
    }

    defaultConfiguration() {
        return Utils.Merge(
            super.defaultConfiguration(), {
                dataStructure: "tree",
                keyExpr: "id",
                rootValue: TreeView.ROOT_VALUE,
                autoExpandAll: true,
            }
        )
    }

    selectItem(id, select = true) {
        if (select == true) {
            this.instance().selectItem(id);
        } else {
            this.instance().unselectItem(id);
        }
    }

}

class TreeViewItem {

    constructor(parameters) {
        Object.keys(parameters).forEach(key =>
            this[key] = parameters[key])
        if (this.id === undefined) {
            this.id = Strings.NewGuid()
        }
        this.items = []
    }

    addItem(parameters) {
        const item = new NotasVisualizaItem(Object.assign({}, parameters, { parent: this }));
        this.items.push(item);
        return item;
    }

    add(parameters) {
        this.addItem(parameters);
        return this;
    }

    root() {
        let root = this;
        while (Utils.IsDefined(root.parent)) {
            root = root.parent;
        }
        return root;
    }

    find(id) {
        if (this.id == id) {
            return this;
        } else {
            for (const subItem of this.items) {
                const found = subItem.find(id);
                if (found != undefined) {
                    return found;
                }
            }
        }
    }

}