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
                    groupPanel: {
                        visible: this.groupColumns()
                    },
                    onContentReady: e => this.listOnContentReady(e),
                    onRowDblClick: e => this.listOnRowDblClick(e),
                    onKeyDown: e => this.listOnKeyDown(e),
                    onDataErrorOccurred: e => this.listOnDataErrorOccurred(e),
                    onDisposing: e => this.listOnDisposing(e)
                },
                contextMenu: {}
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

    listColumns() {}

    groupColumns() {
        return true;
    }

    allow(operation) {
        if (!this.configuration().operations.includes(operation)) {
            return false;
        }
        if (["edit", "delete"].includes(operation) && !this.isFocusedRowData()) {
            return false;
        }
        if (["insert", "edit"].includes(operation) && this.formViewClass() == undefined) {
            return false;
        }
        if (["edit", "delete", "export"].includes(operation) && !this.list().hasRows()) {
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
                this._dataHasChanged = closeData.dataHasChanged;
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

    deleteRow(id) {
        this.list().deleteRow({
            path: this.path(),
            id: id
        }).catch(err =>
            App.ShowError({ message: this.deleteErrorMessage(err) }));
    }

    deleteErrorMessage(err) {
        return "No es posible borrar el registro"
    }

    relatedTableName(err) {
        let tableName = Strings.RemoveChars(Strings.SubstringAfter(err.message, "en la tabla"), ["«", "»"]);
        return tableName != undefined ? tableName.trim() : "";
    }

    path() {
        return this.className().toLowerCase();
    }

    deleteMessage() {
        return this.composeDeleteMessage({ title: "este Registro" })
    }

    composeDeleteMessage(p) {
        return Html.Bold() + "Borra " + p.title + " ?" + Html.LineFeed(3) + Strings.SingleQuotes(p.description);
    }

    composeDeleteErrorMessasge(p) {
        return Html.Bold() + "No es posible borrar " + p.name + Html.LineFeed(2) +
            Html.Tab() + Strings.SingleQuotes(p.description) + Html.LineFeed(2) +
            "debido a que está " + p.vinculo + " a registros de " + Html.LineFeed(2) +
            Html.Tab() + Strings.Capitalize(this.relatedTableName(p.err))

    }

    getFocusedRow() {
        return this.list().focusedRow();
    }

    getRowType() {
        const row = this.getFocusedRow();
        if (row != undefined) {
            return row.rowType
        }
    }

    isFocusedRowGroup() {
        return this.getRowType() == "group";
    }

    isFocusedRowData() {
        return this.getRowType() == "data";
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

    dataSource() {
        return this.list().getDataSource();
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
        return [this.itemInsert(), this.itemExportExcel()]
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

    itemExport() {
        if (this.allow("export")) {
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
        super.afterRender();
        if (this.list().columnCount() == 1) {
            this.list().setProperty("groupPanel.visible", false);
        }
        this.contextMenu().setProperty("target", this.findElementByClass("list"));
        if (this.isPopup()) {
            this.label().setVisible(false);
        } else {
            this.label().setText(this.labelText());
        }
        return this.loadState();
    }

    focus() {
        this.list().focus();
    }

    focusRowById(id) {
        this.list().focusRowById(id)
    }

    listOnContentReady(e) {
        this.refreshToolbar();
        this.refreshContextMenuItems()
        this.focus()
    }

    listOnDisposing(e) {
        this.saveState();
    }

    loadState() {
        return Users.GetState({ module: this.className() }).then(s =>
            this.setState(s != null ? JSON.parse(s) : { list: null }))
    }

    saveState() {
        Users.SaveState({ module: this.className(), state: this.state() })
    }

    setState(state) {
        if (state.fullScreen == true) {
            App.HideItems();
        }
        this.list().setState(state.list)
    }

    state() {
        return { fullScreen: App.ItemsAreHide(), list: this.list().getState() }
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
        if (this.isPopup()) {
            this.close({ error: true })
        } else {
            App.BlankViewElement()
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

    setDataSource(dataSource) {
        this.list().setDataSource(dataSource);
    }

    masterView() {
        return this.parameters().masterView;
    }

    hasRows() {
        return this.list().hasRows()
    }

    static DataSource() {
        if (this._DataSource == undefined) {
            this._DataSource = this.DefineDataSource();
        }
        return this._DataSource;
    }

    static DefineDataSource() {}

    static Render() {
        this.Instance().render();
    }

}