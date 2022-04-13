class ExportExcelDialog extends EntryView {

    popupConfiguration() {
        return {
            title: "Exporta a Excel",
            width: this.parameters().width || 550,
            height: 200
        }
    }

    formItems() {
        return [
            Item.Text({
                dataField: "nombre",
                label: "Nombre del archivo a exportar",
                value: this.parameters().fileName,
                required: true
            })
        ]
    }

}