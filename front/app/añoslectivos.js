class AñosLectivos extends LocalMemoryTable {

    static DefineData() {
        let max = Dates.ThisYear();
        let min = max - 10;
        let years = [];
        for (let year = max; year > min; year--) {
            years.push({ id: year, nombre: year })
        }
        return years;
    }

}