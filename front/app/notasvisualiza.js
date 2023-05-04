class NotasVisualiza extends View {

    static TIPO_RAIZ = 0;
    static TIPO_PERIODO = 1;
    static TIPO_PRELIMINAR = 2;
    static TIPO_STATUS = 3;
    static TIPO_ANUAL = 4;

    constructor(parameters) {
        super(parameters)
        this.notas = this.parameters().notas;
        this.notasData = this.notas.notasData()
    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Visualiza Columnas de Notas",
                showCloseButton: false,
                height: 450,
                width: 400,
                resizeEnabled: true
            },
            components: {
                tree: {
                    componentClass: TreeView,
                    dataSource: this.dataSource(),
                    selectionMode: "multiple",
                    selectNodesRecursive: false,
                    showCheckBoxesMode: "normal",
                    showBorders: false,
                    showBorders: true,
                    selectByClick: true,
                    displayExpr: "nombre",
                    onItemSelectionChanged: e => this.treeOnItemSelectionChanged(e)
                },
                toolbar: {
                    items: this.toolbarItems()
                }
            }
        }
    }

    toolbarItems() {
        return [this.itemSalida()]
    }

    itemSalida() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "close",
                text: "Salida",
                onClick: e => this.close()
            }
        }
    }

    tree() {
        return this.components().tree;
    }

    preliminarId(periodo) {
        const item = this.dataSource().find(item => item.tipo == NotasVisualiza.TIPO_PRELIMINAR && item.parent == periodo)
        if (item != undefined) {
            return item.id;
        }
    }

    statusId(periodo) {
        const item = this.dataSource().find(item => item.tipo == NotasVisualiza.TIPO_STATUS && item.parent == periodo)
        if (item != undefined) {
            return item.id;
        }
    }

    selectPeriodoItems(periodo) {
        this.tree().selectItem(this.preliminarId(periodo))
        this.tree().selectItem(this.statusId(periodo))
    }

    unselectPeriodoItems(periodo) {
        this.tree().unselectItem(this.preliminarId(periodo))
        this.tree().unselectItem(this.statusId(periodo))
    }

    treeOnItemSelectionChanged(e) {
        this.selectItems(e.itemData)
    }

    selectItems(itemData) {
        this.tree().beginUpdate();
        try {
            if (itemData.tipo == NotasVisualiza.TIPO_PERIODO) {
                const visible = this.notas.toggleColumnVisibility("periodo_" + itemData.id);
                if (visible) {
                    this.selectPeriodoItems(itemData.id)
                } else {
                    this.unselectPeriodoItems(itemData.id)
                }
            } else if (itemData.tipo == NotasVisualiza.TIPO_PRELIMINAR) {
                this.notas.toggleColumnVisibility("preliminar_" + itemData.parent);
            }
            if (itemData.tipo == NotasVisualiza.TIPO_STATUS) {
                this.notas.toggleColumnVisibility("status_" + itemData.parent);
            }
            if (itemData.tipo == NotasVisualiza.TIPO_ANUAL) {
                this.notas.toggleColumnVisibility("anual");
            }
        } finally {
            this.tree().endUpdate()
        }
    }

    defineTemplate() {
        return new NotasVisualizaTemplate()
    }

    dataSource() {
        if (this._dataSource == undefined) {
            this._dataSource = this.defineDataSource();
        }
        return this._dataSource;
    }

    defineDataSource() {
        this.ds = [];
        this.addRootNode();
        this.addPeriodosRows();
        this.addAnualRow()
        return this.ds;
    }

    addRootNode() {
        this.rootId = Strings.NewGuid()
        this.rootNode = {
            id: this.rootId,
            parent: null,
            nombre: "Todas",
            tipo: NotasVisualiza.TIPO_RAIZ,
            expanded: true
        }
        this.ds.push(this.rootNode)
    }

    addPeriodosRows() {
        for (const row of this.notasData.periodosRows) {
            this.ds.push({
                id: row.id,
                parent: this.rootId,
                nombre: row.nombre + Notas.TemporalidadDescripcion(row.temporalidad),
                tipo: NotasVisualiza.TIPO_PERIODO,
                expanded: true,
                selected: this.notas.columnaPeriodoVisible(row.id),
            })
            this.addPeriodoRows(row.id)
        }
    }

    addPeriodoRows(periodo) {
        this.ds.push({
            id: Strings.NewGuid(),
            parent: periodo,
            nombre: "Preliminar",
            tipo: NotasVisualiza.TIPO_PRELIMINAR,
            selected: this.notas.columnaPreliminarVisible(periodo),
            expanded: true,
        })
        this.ds.push({
            id: Strings.NewGuid(),
            parent: periodo,
            nombre: "Status",
            tipo: NotasVisualiza.TIPO_STATUS,
            selected: this.notas.columnaStatusVisible(periodo),
            expanded: true,
        })
    }

    addAnualRow(parent) {
        this.ds.push({
            id: Strings.NewGuid(),
            nombre: "Anual",
            tipo: NotasVisualiza.TIPO_ANUAL,
            parent: this.rootId,
            selected: this.notas.columnaAnualVisible(),
        })
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