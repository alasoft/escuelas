class Arrays {

    static NoNulls(array) {
        return array.filter(
            e => e != undefined && e != null
        )
    }

    static ToDate(array, names) {
        array.forEach(e =>
            names.forEach(n =>
                e[n] = Dates.ToDate(e[n])
            )
        )
    }

}