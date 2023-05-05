class ListViewBase extends View {

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                contextMenu: {
                    target: this.findElementByClass("list")
                },
                list: {
                    onContentReady: e => this.listOnContentReady(e),
                    onDisposing: e => this.listOnDisposing(e),
                },
                excel: {}
            }
        })
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

    listToolbarItems() {}

    itemExcel() {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "exportxlsx",
                hint: "Exporta a Excel",
                onClick: e => this.exportExcelDialog(e)
            }
        }
    }

    refreshContextMenu() {
        if (this.contextMenu() != undefined && this.contextMenu().instance() != undefined) {
            this.contextMenu().setItems(this.contextMenuItems());
        }
    }

    contextItemExporta() {
        return {
            text: "Exporta Excel",
            onClick: e => this.exportExcelDialog()
        }
    }

    exportExcelDialog(e) {
        new ExportExcelDialog({ fileName: this.excelFileName(), width: this.excelDialogWidth() }).render()
            .then(data => {
                if (data.okey) {
                    this.exportExcel({
                        e: e,
                        fileName: this.excelFileName(),
                        title: this.excelTitle()
                    })
                }
            })
    }

    excelFileName() {
        return this.configuration().excel.fileName || this.className();
    }

    excelDialogWidth() {
        return this.configuration().excel.dialogWidth || App.EXCEL_DIALOG_WIDTH
    }

    excelTitle() {
        return this.configuration().excel.title || this.excelFileName()
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

    clearSettingState() {
        if (this.settingState == true) {
            this.settingState = false;
        }
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

    listOnContentReady(e) {
        this.refreshContextMenu()
    }

    listOnDisposing(e) {
        this.saveState();
    }

}