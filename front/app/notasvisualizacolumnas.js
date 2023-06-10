class NotasVisualizaColumnas extends View {

    constructor(parameters) {
        super(parameters)
        this.notas = parameters.notas;
        this.notasData = this.notas.notasData()
        this.rows = [];
    }

    extraConfiguration() {
        return {
            mode: "popup",
            popup: {
                title: "Visualiza Columnas",
                width: 450,
                height: 650,
                resizeEnabled: true
            },
            components: {
                tree: {
                    dataStructure: "plain",
                    dataSource: this.dataSource(),
                    parentIdExpr: "parent",
                    selectedExpr: "selected",
                    columns: ["text"],
                    showBorders: true,
                    selectedRowKeys: this.selectedRowKeys(),
                    selection: {
                        mode: "multiple",
                        recursive: true,
                    },
                    onSelectionChanged: e => this.onSelectionChanged(e)
                },
                toolbar: {
                    items: this.toolbarItems()
                }
            }

        }
    }

    list() {
        return this.notas.list()
    }

    tree() {
        return this.components().tree
    }

    toolbarItems() {
        return [this.itemSalida()]
    }

    itemSalida() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "close",
                text: "Salida",
                onClick: e => this.close()
            }
        }
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
        this.addRootRow();
        this.addPeriodosRows();
        this.addAnualRow();
        return this.rows
    }

    addRootRow() {
        this.rootId = Strings.NewGuid()
        this.addRow({
            id: this.rootId,
            parent: null,
            text: "Todas",
        })
    }

    addPeriodosRows() {
        for (const periodoRow of this.notasData.periodosRows) {
            const row = this.addRow({
                text: periodoRow.nombre,
                periodo: periodoRow.id,
                temporalidad: periodoRow.temporalidad,
                columnName: "periodo_" + periodoRow.id
            })
            this.addPeriodoRows(row);
        }
    }

    addPeriodoRows(row) {
        this.addRow({
            parent: row.id,
            text: "Examenes",
            columnName: "examenes_" + row.periodo
        })
        if (Dates.NoEsFuturo(row.temporalidad)) {
            this.addRow({
                parent: row.id,
                text: "Preliminar",
                columnName: "preliminar_" + row.periodo
            })
            this.addRow({
                parent: row.id,
                text: "Promedio",
                columnName: "promedio_" + row.periodo
            })
            this.addRow({
                parent: row.id,
                text: "Status",
                columnName: "status_" + row.periodo
            })
        }
    }

    addAnualRow() {
        if (this.notasData.hasPeriodos()) {
            this.addRow({
                text: "Anual",
                columnName: "anual"
            })
        }
    }

    addRow(row) {
        if (row.id === undefined) {
            row.id = Strings.NewGuid()
        }
        if (row.parent === undefined) {
            row.parent = this.rootId;
        }
        row.expanded = true;
        this.rows.push(row)
        return row;
    }

    selectedRowKeys() {
        const keys = [];
        for (const row of this.dataSource()) {
            if (!this.hasChilds(row)) {
                if (row.columnName != undefined && this.list().isColumnVisible(row.columnName)) {
                    keys.push(row.id)
                }

            }
        }
        return keys;
    }


    getRowById(id) {
        return this.rows.find(row => row.id == id)
    }

    getParentRow(row) {
        if (row.parent != null) {
            return this.getRowById(row.parent)
        }
    }

    hasChilds(parentRow) {
        return this.dataSource().find(row =>
            row.parent == parentRow.id) != undefined
    }

    refreshColumns() {
        this.list().beginUpdate();
        try {
            this.visibleColumnsMap().forEach(visibleColumn =>
                this.list().showColumn(visibleColumn.columnName, visibleColumn.visible)
            )
        } finally {
            this.list().endUpdate()
        }
    }

    visibleColumnsMap() {
        if (this._visibleColumnsMap == undefined) {
            this._visibleColumnsMap = this.defineVisibleColumnsMap()
        }
        return this._visibleColumnsMap;
    }

    defineVisibleColumnsMap() {
        const map = new Map();
        this.addVisibleColumnsToMap(map, this.tree().getSelectedKeys());
        for (const id of this.tree().getSelectedKeys()) {
            this.addVisibleColumnsToMap(map, this.parentKeys(this.getRowById(id)))
        }
        for (const row of this.dataSource()) {
            if (row.columnName != undefined) {
                if (map.get(row.id) == undefined) {
                    map.set(row.id, { columnName: row.columnName, visible: false })
                }
            }
        }
        return map;
    }

    addVisibleColumnsToMap(map, ids) {
        for (const id of ids) {
            const row = this.getRowById(id);
            if (row.columnName != undefined) {
                if (map.get(id) == undefined) {
                    map.set(id, { columnName: row.columnName, visible: true })
                }
            }
        }
    }

    parentKeys(row) {
        const keys = []
        let parentRow = this.getParentRow(row);
        while (parentRow != undefined) {
            if (parentRow.columnName != undefined) {
                keys.push(parentRow.id)
            }
            parentRow = this.getParentRow(parentRow);
        }
        return keys;
    }

    clearVisibleColumnsMap() {
        this._visibleColumnsMap = undefined;
    }

    onSelectionChanged(e) {
        this.clearVisibleColumnsMap();
        this.refreshColumns()
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