class ListViewBase extends View {

    defineTemplate() {
        return new ListViewBaseTemplate()
    }

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

    labelText() {

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

    rowValue(dataField) {
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

    excelExport(p) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(p.fileName);

        Utils.Evaluate(p.before);

        DevExpress.excelExporter.exportDataGrid({
            component: this.list().instance(),
            worksheet,
            autoFilterEnabled: true,
            topLeftCell: { row: 4, column: 1 }
        })
            .then(cellRange => {
                const headerRow = worksheet.getRow(2);
                headerRow.height = 30;
                worksheet.mergeCells(2, 1, 2, this.list().columnCount());
                for (let i = 1; i <= this.list().columnCount(); i++) {
                    worksheet.getColumn(i).width = p.columnWidth || 30;
                }

                headerRow.getCell(1).value = p.title || p.fileName;
                headerRow.getCell(1).font = { name: 'Calibri bold', size: 12 };
                headerRow.getCell(1).alignment = { horizontal: 'center' };
            })
            .then(() => {
                workbook.xlsx.writeBuffer().then((buffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), p.fileName + '.xlsx');
                });
            });
        p.e.cancel = true;
    }

}

class ListViewBaseTemplate extends Template {

    extraConfiguration() {
        return {
            fillContainer: true,
            orientation: "vertical",
            items: [
                this.label(),
                this.body(),
            ]
        }
    }

    label() {
        return {
            name: "label",
            marginBottom: App.LABEL_BOTTOM_MARGIN
        }
    }

    body() {
        return {
            fillContainer: true,
            orientation: "vertical",
            padding: App.BOX_PADDING,
            backgroundColor: App.BOX_BACKGROUND_COLOR,
            items: [
                this.list(),
                this.contextMenu()
            ]
        }
    }

    list() {
        return {
            name: "list",
            fillContainer: true,
            orientation: "vertical",
            height: 1
        }
    }

    contextMenu() {
        return {
            name: "contextMenu"
        }
    }

}