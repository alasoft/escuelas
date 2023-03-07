class Column {

    static BaseColumn(p = {}) {
        return {
            dataField: p.dataField,
            name: p.name,
            dataType: p.dataType,
            format: p.format,
            caption: p.caption,
            width: p.width,
            calculateCellValue: p.formula,
            allowHeaderFiltering: p.filtering != false,
            allowSorting: p.sorting != false,
            visible: p.visible != false,
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
            format: p.format || App.DATE_FORMAT,
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

}