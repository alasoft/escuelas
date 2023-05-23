class ListViewBase extends View {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                label: {
                    text: this.labelText()
                },
                list: {
                    onContentReady: e => this.listOnContentReady(e),
                    onDisposing: e => this.listOnDisposing(e),
                },
                contextMenu: {
                    target: this.findElementByClass("list")
                },
                excel: {}
            }
        })
    }

    labelText(){
        
    }

    list() {
        return this.components().list;
    }

    contextMenu() {
        return this.components().contextMenu;
    }

    refreshListToolbar() {
        this.list().setToolbarItems(this.listToolbarItems())
    }

    listToolbarItems() { }

    itemExcel() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "exportxlsx",
                hint: "Exporta a Excel",
                onClick: e => this.excelExportDialog(e)
            }
        }
    }

    refreshContextMenu() {
        if (this.contextMenu() != undefined && this.contextMenu().instance() != undefined) {
            this.contextMenu().setItems(this.contextMenuItems());
        }
    }

    contextMenuItems() {
        return [this.contextItemExcelExport()]
    }

    contextItemExcelExport() {
        return {
            beginGroup: true,
            text: "Exporta Excel",
            onClick: e => this.excelExportDialog()
        }
    }

    excelExportDialog(e) {
        new ExcelExportDialog({ fileName: this.excelFileName(), width: this.excelDialogWidth() }).render()
            .then(data => {
                if (data.okey) {
                    this.excelExport({
                        e: e,
                        fileName: this.excelFileName(),
                        title: this.excelTitle()
                    })
                }
            })
    }

    excelFileName() {
        return this.className()
    }

    excelDialogWidth() {
        return App.EXCEL_DIALOG_WIDTH
    }

    excelTitle() {
        return this.excelFileName()
    }

    showColumn(name, visible) {
        this.list().showColumn(name, visible)
    }

    toggleColumnVisibility(name) {
        return this.list().toggleColumnVisibility(name);
    }

    isColumnVisible(name) {
        return this.list().isColumnVisible(name);
    }

    getColumnsVisibility() {
        return this.list().getColumnsVisibility()
    }

    anterior() {
        return this.list().focusPriorRow();
    }

    siguiente() {
        return this.list().focusNextRow()
    }

    row(dataField) {
        return this.list().focusedRowValue(dataField)
    }

    emptyState() {
        return { list: {} }
    }

    closeDataDefault() {
        return { dataHasChanged: this.dataHasChanged }
    }

    listOnContentReady(e) {
        this.refreshContextMenu()
    }

    listOnDisposing(e) {
        this.saveState();
    }

}