class ListView extends View {

    constructor(...parameters) {
        super(...parameters);
        this.class()._DataSource = undefined;
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                label: {
                    text: this.labelText()
                },
                list: {
                    dataSource: this.class().DataSource(),
                    columns: this.listColumns(),
                    onContentReady: e => this.listOnContentReady(e),
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    onKeyDown: e => this.listOnKeyDown(e),
                    onDataErrorOccurred: e => this.listOnDataErrorOccurred(e)
                },
                contextMenu: {}
            },
            operations: {
                editable: true,
                allowInserting: true,
                allowEditing: true,
                allowDeleting: true,
                allowExport: false,
                deleteMessage: "Borra este registro ?"
            }

        })
    }

    templateDefault() {
        return Templates.ListView();
    }

    label() {
        return this.components().label;
    }

    list() {
        return this.components().list;
    }

    contextMenu() {
        return this.components().contextMenu;
    }

    labelText() {}

    listColumns() {}

    setDataSource(dataSource) {
        this.list().setDataSource(dataSource);
    }

    allowInserting() {
        return this.allowOperation("inserting")
    }

    allowEditing() {
        return this.allowOperation("editing", true);
    }

    allowDeleting() {
        return this.allowOperation("deleting", true)
    }

    allowExport() {
        return this.allowOperation("export", true)
    }

    allowOperation(operationName, checkHasRows = false) {
        const operations = this.operations();
        return Utils.Evaluate(operations.editable) &&
            (checkHasRows ? this.list().hasRows() : true) &&
            Utils.Evaluate(operations["allow" + Utils.Capitalize(operationName)])
    }

    operations() {
        return this.configuration().operations;
    }

    insert() {
        this.formView(null, "insert").render();
    }

    edit() {
        this.formView({
            components: {
                form: {
                    formData: { id: this.id() }
                }
            }
        }, "edit").render();
    }

    delete() {
        let rowIndex = this.list().focusedRowIndex();
        App.YesNo(this.deleteMessage(this.list().rowData(rowIndex))).done(
            result => result ? this.list().deleteRow(rowIndex) : undefined
        )
    }

    deleteMessage() {
        return this.operations().deleteMessage;
    }

    formView(extraConfiguration, mode) {
        return new(this.formViewClass())(
            Utils.Merge({
                    listView: this,
                    components: {
                        form: {
                            formData: this.formViewDefaultValues(mode)
                        }
                    }
                },
                extraConfiguration
            )
        );
    }

    formViewDefaultValues(mode) {}

    focusedRowData() {
        return this.list().focusedRowData();
    }

    id() {
        return this.list().id();
    }

    refresh(id) {
        this.list().refresh(id);
    }

    refreshListToolbar() {
        this.list().setToolbarItems(this.listToolbarItems());
    }

    listToolbarItems() {
        return [this.itemInsert(), this.itemGroupPanel(), this.itemExportButton(), this.itemSearchPanel()]
    }

    itemInsert() {
        if (this.allowInserting() && this.list().dataSource() != undefined) {
            return {
                widget: "dxButton",
                location: "before",
                options: {
                    icon: "add",
                    hint: "Agrega",
                    onClick: e => this.insert()
                }
            }
        }
    }

    itemGroupPanel() {
        if (this.list().hasRows()) {
            return "groupPanel";
        }
    }

    listToolbarItems() {
        return [this.itemInsert(), this.itemGroupPanel(), this.itemExportButton(), this.itemSearchPanel()]
    }

    itemExportButton() {
        if (this.allowExport(true)) {
            return {
                widget: "dxButton",
                location: "after",
                options: {
                    icon: "exportxlsx",
                    hint: "Exporta a Excel",
                    onClick: e => this.exportToExcel(e)
                }
            }
        }
    }

    itemSearchPanel() {
        if (this.list().hasRows() || this.list().hasSearchText()) {
            return "searchPanel"
        }
    }

    refreshContextMenuItems() {
        if (this.contextMenu() != undefined && this.contextMenu().instance() != undefined) {
            this.contextMenu().setItems(this.contextMenuItems());
        }
    }

    contextMenuItems() {
        return [
            this.cmItemInsert(),
            this.cmItemEdit(),
            this.cmItemDelete(),
        ]
    }

    cmItemInsert() {
        if (this.allowInserting()) {
            return {
                text: "Agrega",
                onClick: e => this.insert(),
            }
        }
    }

    cmItemEdit() {
        if (this.allowEditing()) {
            return {
                text: "Modifica",
                onClick: e => this.edit(),
            }
        }
    }

    cmItemDelete() {
        if (this.allowDeleting()) {
            return {
                text: "Borra",
                onClick: e => this.delete(),
            }
        }
    }

    afterRenderComponents() {
        this.contextMenu().setProperty("target", this.findElement("list"));
        if (this.isPopup()) {
            this.label().setVisible(false);
        } else {
            this.label().setText(this.labelText());
        }
    }

    dataSource() {
        return this.list().dataSource();
    }

    focus() {
        this.list().focus();
    }

    listOnContentReady(e) {
        this.refreshListToolbar();
        this.refreshContextMenuItems()
    }

    listOnRowDblClick(e) {
        this.edit();
    }

    listOnKeyDown(e) {
        if (e.event.key == "Insert" && this.allowInserting()) {
            this.insert();
        } else
        if (e.event.key == "Enter" && this.allowEditing()) {
            this.edit()
        } else
        if (e.event.key == "Delete" && this.allowDeleting()) {
            this.delete();
        }
    }

    listOnDataErrorOccurred(e) {
        App.ShowError({ message: "Ha ocurrido un error durante la carga de datos .." })
            .then(() => {
                if (this.isPopup()) {
                    this.close()
                } else {
                    App.BlankViewElement()
                }
            })
    }

    exportToExcel(e) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Employees');

        DevExpress.excelExporter.exportDataGrid({
            component: this.list().instance(),
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Employees.xlsx');
            });
        });
        e.cancel = true;
    }

    static DataSource() {
        if (this._DataSource == undefined) {
            this._DataSource = this.DefineDataSource();
        }
        return this._DataSource;
    }

    static DefineDataSource() {}

    static RawData() {
        return this.DataSource().__rawData;
    }

    static GetById(id, dataField) {
        const row = this.RawData().find(
            row => row.id == id
        )
        if (row != undefined) {
            return row[dataField]
        }
    }

}