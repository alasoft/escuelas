class Column {

    static BaseColumn(p = {}) {
        return {
            dataField: p.dataField,
            name: p.name,
            dataType: p.dataType,
            format: p.format,
            caption: p.caption,
            width: p.width,
            groupIndex: p.groupIndex,
            calculateCellValue: p.formula,
            allowHeaderFiltering: p.filtering != false,
            allowSorting: p.sorting != false,
            allowEditing: p.editing != false,
            allowGrouping: true,
            alignment: p.alignment,
            visible: p.visible != false,
            cellTemplate: p.template,
            editCellTemplate: p.editor,
            headerFilter: {
                width: p.filterWidth
            },
            sortingMethod: p.sort
        }
    }

    static Id(p = {}) {
        return Utils.Merge({
            dataField: App.KEY_NAME,
            visible: false
        }, p)
    }

    static Text(p) {
        return this.BaseColumn(p)
    }

    static Date(p) {
        return this.BaseColumn(Utils.Merge({
            dataType: "date",
            format: App.DATE_FORMAT,
            width: App.DATE_COLUMN_WIDTH,
            alignment: p.alignment || "center"
        }, p))
    }

    static Time(p) {
        return this.BaseColumn(Utils.Merge({
            dataType: "time",
            format: p.format || App.TIME_FORMAT,
        }, p))
    }

    static Calculated(p) {
        return this.BaseColumn(p)
    }

    static Invisible(p = {}) {
        return this.BaseColumn(Utils.Merge({
            visible: false
        }, p))
    }

    static Space() {
        return {}
    }

    static Empty() {
        return {}
    }

}