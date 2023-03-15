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

    path() {
        return this.class().Path();
    }

    listColumns() {}

    allow(operation) {
        if (!this.configuration().operations.includes(operation)) {
            return false;
        }
        if (Strings.StringIs(operation, ["insert", "edit"]) && this.formViewClass() == undefined) {
            return false;
        }
        if (Strings.StringIs(operation, ["edit", "delete", "export"]) && !this.list().hasRows()) {
            return false;
        }
        if (Strings.StringIs(operation, ["edit", "delete"]) && !this.isFocusedRowData()) {
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
                App.ShowError({ message: this.deleteErrorMessage(err) }));
    }

    deleteErrorMessage(err) {
        return "No es posible borrar el registro"
    }

    relatedTableName(err) {
        let tableName = Strings.RemoveChars(Strings.SubstringAfter(err.message, "en la tabla"), ["«", "»"]);
        return tableName != undefined ? tableName.trim() : "";
    }

    composeDeleteErrorMessasge(p) {
        return Html.Bold() + "No es posible borrar " + p.name + Html.LineFeed(2) +
            Html.Tab() + Strings.SingleQuotes(p.description) + Html.LineFeed(2) +
            "debido a que está " + p.vinculo + " a registros de " + Html.LineFeed(2) +
            Html.Tab() + Strings.Capitalize(this.relatedTableName(p.err))

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
        return [this.itemInsert(), this.itemExport()]
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
        this.focus()
        this.refreshToolbar();
        this.refreshContextMenuItems()
    }

    listOnDisposing(e) {
        this.saveState();
    }

    loadState() {
        return Users.GetState({ module: this.className() }).then(s =>
            this.setState(s != null ? JSON.parse(s) : { list: null }))
    }

    saveState() {
        if (this.dataErrorOcurred != true) {
            Users.SaveState({ module: this.className(), state: this.state() })
        }
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
        return { dataHasChanged: this.dataHasChanged }
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