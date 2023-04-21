class ListView extends View {

    constructor(parameters) {
        super(parameters);
    }

    defaultConfiguration() {
        return Utils.Merge(super.defaultConfiguration(), {
            components: {
                label: {
                    text: this.labelText()
                },
                filter: {
                    visible: false,
                },
                toolbar: {},
                list: {
                    dataSource: this.class().DataSource(),
                    columns: this.listColumns(),
                    toolbar: {
                        items: ["groupPanel", this.itemExportExcel(), "searchPanel"]
                    },
                    errorRowEnabled: false,
                    groupPanel: {
                        visible: true
                    },
                    onContentReady: e => this.listOnContentReady(e),
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    onKeyDown: e => this.listOnKeyDown(e),
                    onDataErrorOccurred: e => this.listOnDataErrorOccurred(e),
                    onDisposing: e => this.listOnDisposing(e)
                },
                contextMenu: {
                    target: this.findElementByClass("list")
                }
            },
            editable: true,
            operations: ["insert", "edit", "delete", "export"],
            excelFileName: this.className()
        })
    }

    defineTemplate() {
        return new ListViewTemplate();
    }

    labelText() {}

    path() {
        return this.class().Path();
    }

    listColumns() {}

    allow(operation) {
        if (!this.configuration().operations.includes(operation)) {
            return false;
        }
        if (["insert", "edit"].includes(operation) && this.formViewClass() == undefined) {
            return false;
        }
        if (["edit", "delete", "export"].includes(operation) && !this.list().hasRows()) {
            return false;
        }
        if (["edit", "delete"].includes(operation) && !this.isFocusedRowData()) {
            return false;
        }
        return true;
    }

    insert() {
        if (this.allow("insert")) {
            this.formViewRender(this.formViewDefaultValues("insert"));
        }
    }

    edit() {
        if (this.allow("edit")) {
            this.formViewRender(Utils.Merge(this.formViewDefaultValues("edit"), { id: this.id() }));
        }
    }

    formViewRender(formData) {
        this.formView(formData).render().then(closeData => {
            if (closeData != undefined) {
                this.dataHasChanged = closeData.dataHasChanged;
            }
        })
    }

    formView(formData) {
        return new(this.formViewClass())({
            listView: this,
            components: {
                form: {
                    formData: formData
                }
            }
        });
    }

    formViewClass() {}

    formViewDefaultValues(mode) {}

    delete() {
        if (this.allow("delete")) {
            App.YesNo({ message: this.deleteMessage() }).then(
                closeData => {
                    if (closeData.okey) {
                        this.deleteRow(this.id());
                    }
                }
            )
        }
    }

    deleteMessage() {
        return Html.Bold() + "Borra este Registro";
    }

    deleteRow(id) {
        this.list().deleteRow({
                path: this.path(),
                id: id
            }).then(() =>
                this.dataHasChanged = true)
            .catch(err =>
                this.deleteErrorMessage(err));
    }

    deleteErrorMessage(err) {
        App.ShowMessage([{
            message: "No es posible borrar este registro",
            detail: this.rowDescription(),
        }, {
            message: "Debido a que hay registros vinculados de la Tabla",
            detail: this.relatedTableName(err)
        }])
    }

    rowDescription() {
        return this.focusedRowValue("nombre");
    }

    relatedTableName(err) {
        let tableName = Strings.RemoveChars(Strings.SubstringAfter(err.message, "en la tabla"), ["«", "»"]);
        return tableName != undefined ? App.TranslateTableName(tableName) : "";
    }

    rowType() {
        const row = this.list().focusedRow();
        if (row != undefined) {
            return row.rowType
        }
    }

    isFocusedRowGroup() {
        return this.rowType() == "group";
    }

    isFocusedRowData() {
        return this.rowType() == "data";
    }

    focusedRowValue(dataField) {
        return this.list().focusedRowValue(dataField);
    }

    focusedRowData() {
        return this.list().focusedRowData();
    }

    focusedRowValue(dataField) {
        return this.list().focusedRowValue(dataField);
    }

    label() {
        return this.components().label;
    }

    toolbar() {
        return this.components().toolbar;
    }

    list() {
        return this.components().list;
    }

    contextMenu() {
        return this.components().contextMenu;
    }

    id() {
        return this.list().id();
    }

    refresh(id) {
        this.list().refresh(id);
    }

    refreshToolbar() {
        this.toolbar().setItems(this.toolbarItems());
    }

    toolbarItems() {
        return [this.itemInsert()]
    }

    itemInsert() {
        if (this.allow("insert") && this.list().getDataSource() != undefined) {
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

    itemExportExcel() {
        //        if (this.allow("export")) {
        return {
            widget: "dxButton",
            location: "after",
            options: {
                icon: "exportxlsx",
                hint: "Exporta a Excel",
                onClick: e => this.exportExcelDialog(e)
            }
        }
        //        }
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
            this.contextItemInsert(),
            this.contextItemEdit(),
            this.contextItemDelete(),
            this.contextItemCollapseAll(),
            this.contextItemExpandAll(),
        ]
    }

    contextItemCollapseAll() {
        if (this.list().hasGroupedColumns()) {
            return {
                text: "Colapsa todo",
                onClick: e => this.collapseAll()
            }
        }
    }

    contextItemExpandAll() {
        if (this.list().hasGroupedColumns()) {
            return {
                text: "Expande todo",
                onClick: e => this.expandAll()
            }
        }
    }

    collapseAll() {
        this.list().collapseAll();
    }

    expandAll() {
        this.list().expandAll();
    }

    contextItemInsert() {
        if (this.allow("insert")) {
            return {
                text: "Agrega",
                onClick: e => this.insert(),
            }
        }
    }

    contextItemEdit() {
        if (this.allow("edit")) {
            return {
                text: "Modifica",
                onClick: e => this.edit(),
            }
        }
    }

    contextItemDelete() {
        if (this.allow("delete")) {
            return {
                text: "Borra",
                onClick: e => this.delete(),
            }
        }
    }


    afterRender() {
        return super.afterRender().then(() => {
            if (this.list().columnCount() == 1) {
                this.list().setProperty("groupPanel.visible", false);
            }
            if (this.isPopup()) {
                this.label().setVisible(false);
            } else {
                this.label().setText(this.labelText());
            }
        });
    }

    focus() {
        this.list().focus();
    }

    focusRowById(id) {
        this.list().focusRowById(id)
    }

    listOnContentReady(e) {
        this.focusFirstRow();
        this.refreshToolbar();
        this.refreshContextMenuItems()
    }

    focusFirstRow() {
        this.list().focusFirstRow();
    }

    listOnDisposing(e) {
        this.saveState();
    }

    saveState() {
        if (this.dataErrorOcurred != true) {
            super.saveState();
        }
    }

    setState() {
        super.setState();
        this.list()
            .setState(this.state.list || null)
            .focusFirstRow()
    }

    getState() {
        return Utils.Merge(super.getState(), { list: this.list().getState() })
    }

    listOnRowDblClick(e) {
        this.edit();
    }

    listOnKeyDown(e) {
        if (e.event.key == "Insert" && this.allow("insert")) {
            this.insert();
        } else
        if (e.event.key == "Enter" && this.allow("edit")) {
            this.edit()
        } else
        if (e.event.key == "Delete" && this.allow("delete")) {
            this.delete();
        }
    }

    listOnDataErrorOccurred(e) {
        this.dataErrorOcurred = true;
        this.list().instance().dispose();
        if (this.isPopup()) {
            this.close({ error: true })
        } else {
            App.BlankViewElement();
            App.SelectFirstItem();
        }
    }

    exportExcelDialog(e) {
        new ExportExcelDialog({ fileName: this.excelFileName(), width: this.exportExcelDialogWidth() }).render()
            .then(data => {
                if (data.okey) {
                    this.exportExcel(e, this.excelFileName())
                }
            })
    }

    exportExcelDialogWidth() {}

    excelFileName() {
        return Utils.Evaluate(this.configuration().excelFileName);
    }

    exportExcel(e, fileName) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(fileName);

        DevExpress.excelExporter.exportDataGrid({
            component: this.list().instance(),
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName + '.xlsx');
            });
        });
        e.cancel = true;
    }

    masterView() {
        return this.parameters().masterView;
    }

    hasRows() {
        return this.list().hasRows()
    }

    closeDataDefault() {
        return { dataHasChanged: this.dataHasChanged, id: this.list().id() }
    }

    static DataSource() {
        if (this._DataSource == undefined) {
            this._DataSource = this.DefineDataSource();
        }
        return this._DataSource;
    }

    static DefineDataSource() {}

    static ClearDataSource() {
        this._DataSource = undefined;
    }

    static Path() {
        return this.ClassName().toLowerCase();
    }

    static Render() {
        this.Instance().render();
    }


}