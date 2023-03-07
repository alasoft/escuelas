class DiasSemana extends LocalMemoryTable {

    static DefineData() {

        return [{
                id: 1,
                nombre: "Lunes",
                abrevia: "Lun"
            },
            {
                id: 2,
                nombre: "Martes",
                abrevia: "Mar"
            },
            {
                id: 3,
                nombre: "Miercoles",
                abrevia: "Mie"
            },
            {
                id: 4,
                nombre: "Jueves",
                abrevia: "Jue"
            },
            {
                id: 5,
                nombre: "Viernes",
                abrevia: "Vie"
            },
            {
                id: 6,
                nombre: "Sabado",
                abrevia: "Sab"
            },
        ]
    }

    static GetAbrevia(id) {
        let item = this.Get(id);
        return item ? item.abrevia || item.nombre : "";

    }

}