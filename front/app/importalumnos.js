class ImportAlumnos extends View {

    extraConfiguration() {
        return {
            mode: "popup",
            popup: { title: "Importación de Alumnos de planilla Excel" },
            components: {
                toolbar: { items: this.toolbarItems() },
                list: {
                    dataSource: [],
                    keyExpr: "id",
                    columns: [{ dataField: "id", visible: false }, {
                        dataField: "apellido"
                    }, {
                        dataField: "nombre"
                    }, {
                        dataField: "email"
                    }, {
                        dataField: "error"
                    }],
                    groupPanel: {
                        visible: false
                    }
                }
            }
        }
    }

    list() {
        return this.components().list;
    }

    defineTemplate() {
        return new Template({
            fillContainer: true,
            orientation: "vertical",
            items: [{
                    name: "toolbar",
                    backgroundColor: App.BOX_BACKGROUND_COLOR,
                },
                {
                    name: "list",
                    fillContainer: true,
                    orientation: "vertical",
                    height: 0
                }, {
                    name: "contextMenu"
                },
            ]
        })
    }

    toolbarItems() {
        return [this.itemImporta()]
    }

    itemImporta() {
        return {
            widget: "dxButton",
            location: "before",
            options: {
                icon: "exportxlsx",
                text: "Selecciona Archivo Excel",
                focusStateEnabled: false,
                onClick: e => this.importaOnClick(e),
            }
        }
    }

    importaOnClick(e) {
        this.fileSelect().click();
    }

    fileSelect() {
        if (this._fileSelect == undefined) {
            this._fileSelect = this.defineFileSelect()
        }
        return this._fileSelect;
    }

    defineFileSelect() {
        var fileSelect = $("<input type='file' id='file-select' name='file-select' style='display:none' accept='.xls,.xlsx'>");
        fileSelect.appendTo(App.AppElement());
        fileSelect.change(e =>
            this.onfileSelected(e.target.files[0])
        );
        return fileSelect;
    }

    onfileSelected(file) {
        const fileReader = new FileReader();
        fileReader.onload = e => this.onLoadFile(e.target.result);
        fileReader.readAsBinaryString(file);
    }

    onLoadFile(binary) {
        const workbook = XLSX.read(binary, {
            type: 'binary'
        });
        workbook.SheetNames.forEach(sheetName =>
            this.rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName])
        )
        this.rows = this.rows.map((row, i) => {
            return {
                id: i,
                apellido: this.get(row, "apellido"),
                nombre: this.get(row, "nombre"),
                email: this.get(row, "email")
            }
        })

        this.list().setDataSource(this.rows);
        this.valida();
        this.list().setDataSource(this.rows)
    }

    get(row, dataField) {
        var key = Object.keys(row).find(key => key.toLowerCase() == dataField.toLowerCase());
        if (key != undefined) {
            return row[key];
        }
    }

    valida() {
        this.validaApellidosNombres()
    }

    validaApellidosNombres() {
        this.rows.forEach(row => this.validaApellidoNombre(row))
    }

    validaApellidoNombre(rowToValidate) {
        let duplicate =
            this.rows.find(row =>
                row.id != rowToValidate.id &&
                row.apellido.toLowerCase() == rowToValidate.apellido.toLowerCase() &&
                row.nombre.toLowerCase() == rowToValidate.nombre.toLowerCase()
            )
        if (duplicate != undefined) {
            rowToValidate.error = true
        }
    }

    importa() {

    }

}