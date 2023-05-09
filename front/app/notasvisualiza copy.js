class NotasVisualiza extends View {

    constructor(parameters) {
        super(parameters)
        this.notas = parameters.notas;
        this.notasData = this.notas.notasData()
    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Visualiza Columnas",
                width: 300,
                height: 700
            },
            components: {
                tree: {
                    componentClass: TreeView,
                    dataSource: this.dataSource(),
                    selectionMode: "multiple",
                    selectNodesRecursive: false,
                    selectByClick: true,
                    showCheckBoxesMode: 'normal',
                    onItemSelectionChanged: e => this.treeViewOnItemSelectionChanged(e)
                }
            }

        }
    }

    tree() {
        return this.components().tree
    }

    defineTemplate() {
        return new NotasVisualizaTemplate()
    }

    dataSource() {
        if (this._dataSource == undefined) {
            this._dataSource = this.defineDatasource();
        }
        return this._dataSource;
    }

    defineDatasource() {
        this.addPeriodosItems();
        this.addAnualItem();
        return [this.rootItem()]
    }

    rootItem() {
        if (this._rootItem == undefined) {
            this._rootItem = this.defineRootItem()
        }
        return this._rootItem;
    }

    defineRootItem() {
        return new NotasVisualizaItem({ id: TreeView.ROOT_VALUE, notas: this.notas, text: "Visualiza" })
    }

    addItems() {
        this.addPeriodosItems();
        this.addAnualItem();
    }

    addPeriodosItems() {
        for (const periodoRow of this.notasData.periodosRows) {
            const periodoItem = this.rootItem()
                .addItem({
                    text: periodoRow.nombre,
                    periodo: periodoRow.id,
                    columnName: "periodo_" + periodoRow.id
                })
            this.addPeriodoItems(periodoItem);
        }
    }

    addPeriodoItems(periodoItem) {
        periodoItem.add({
            text: "Notas",
            columnName: "examenes_" + periodoItem.periodo,
        }).add({
            text: "Preliminar",
            columnName: "preliminar_" + periodoItem.periodo,
        }).add({
            text: "Promedios",
            columnName: "promedio_" + periodoItem.periodo,
        }).add({
            text: "Status",
            periodo: periodoItem.periodo,
            columnName: "status_" + periodoItem.periodo,
        })
    }

    addAnualItem() {
        this.rootItem().add({
            text: "Anual",
            columnName: "anual"
        })
    }

    showColumn(item) {
        item.showColumn();
        if (this.settingData == true) {
            return;
        }
        this.tree().beginUpdate();
        try {
            this.showSubItemsColumns(item);
        } finally {
            this.tree().endUpdate()
        }
    }

    showSubItemsColumns(item) {
        this.settingData = true;
        try {
            for (const subItem of item.items) {
                this.tree().selectItem(subItem.id, item.selected)
            }
        } finally {
            this.settingData = false;
        }
    }

    findItem(id) {
        return this.rootItem().find(id);
    }

    treeViewOnItemSelectionChanged(e) {
        this.showColumn(this.findItem(e.itemData.id));
    }

}

class NotasVisualizaItem extends TreeViewItem {

    constructor(parameters) {
        super(parameters);
        this.notas = this.root().notas;
        this.expanded = true
        if (Utils.IsDefined(this.columnName)) {
            this.selected = this.notas.isColumnVisible(this.columnName)
        }
    }

    showColumn() {
        if (Utils.IsDefined(this.columnName)) {
            this.notas.showColumn(this.columnName, this.selected);
        }
        return this;
    }

}

class NotasVisualizaTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.tree(),
                this.toolbar()
            ]
        }
    }

    tree() {
        return {
            name: "tree",
            fillContainer: true,
            orientation: "vertical",
            marginTop: 10,
            height: 1
        }
    }

    toolbar() {
        return {
            name: "toolbar",
            marginTop: 15,
            borderTop: "thin"
        }
    }
}