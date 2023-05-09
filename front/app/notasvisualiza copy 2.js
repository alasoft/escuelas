class NotasVisualiza extends View {

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
                width: 400,
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
                    selection: {
                        mode: "multiple",
                        recursive: true,
                    },
                    onSelectionChanged: e => this.onSelectionChanged(e)
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
                columnName: "periodo_" + periodoRow.id
            })
            this.addPeriodoRows(row);
        }
    }

    addPeriodoRows(row) {
        this.addRow({
            parent: row.id,
            text: "Notas",
            columnName: "examenes_" + row.periodo
        })
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

    addAnualRow() {
        this.addRow({
            text: "Anual",
            columnName: "anual"
        })
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

    findRow(id) {
        return this.rows.find(row => row.id == id)
    }

    setRowSelected(row, selected) {
        this.setSelected(row, selected)
            //        this.tree().setProperty("dataSource", this.rows);
            //        this.refreshColumns()
    }

    refreshColumns() {
        this.list().beginUpdate();
        try {
            for (const row of this.rows) {
                this.list().showColumn(row.columnName, row.selected)
            }
        } finally {
            this.list().endUpdate()
        }
    }

    setSelected(row, selected) {
        row.selected = selected;
        this.childRows(row.id).forEach(childRow =>
            this.setSelected(childRow, selected)
        )
        this.setSelectedParentRows(row.id)

    }

    setSelectedParentRows(id) {
        let parentRow = this.findParentRow(id);
        while (parentRow != undefined) {
            parentRow.selected = (0 < this.selectedChildsCount(parentRow.id));
            parentRow = this.findRow(parentRow.parent);
        }
    }

    findParentRow(id) {
        const row = this.findRow(id);
        if (row != undefined && row.parent != undefined) {
            return this.findRow(row.parent)
        }
    }

    selectedChildsCount(parent) {
        let count = 0;
        this.childRows(parent).forEach(childRow =>
            childRow.selected == true ? ++count : undefined)
        return count;
    }

    childRows(parent) {
        const childs = [];
        this.rows.forEach(row => row.parent == parent ? childs.push(row) : undefined)
        return childs;
    }

    onSelectionChanged(e) {

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