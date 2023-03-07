class Samples {

    static Persons(rows = 1000) {
        const dataSource = [];
        for (let i = 0; i < rows; i++) {
            dataSource.push({ id: i, firstName: "firstName " + i, lastName: "lastName " + i });
        }
        return dataSource;
    }

    static MultiColumns(parameters) {
        return new MultiColumns(parameters);
    }


}

class MultiColumns {

    constructor(parameters = {}) {
        this.rowsCount = parameters.rowsCount || 100;
        this.columnsCount = parameters.columnsCount || 30;
        this.columnsWidth = parameters.columnsWidth || 50

    }

    dataSource() {
        const dataSource = [];
        for (let i = 0; i < this.rowsCount; i++) {
            dataSource.push(this.row(i));
        }
        return dataSource;
    }

    row(i) {
        const row = {
            id: i
        };
        for (let j = 0; j < this.columnsCount - 1; j++) {
            row["columna" + j] = j;
        }
        return row;
    }

    columns() {
        const columns = [{
            dataField: "id",
            width: this.columnsWidth,
            fixed: true
        }];
        for (let i = 0; i < this.columnsCount - 1; i++) {
            columns.push({
                dataField: "columna" + i,
                width: this.columnsWidth
            })
        }
        return columns;

    }
}