const { MemoryTable } = require("../lib/data/memorytable")

class Turnos extends MemoryTable {

    addItems() {
        this.add("M", "Mañana")
            .add("T", "Tarde")
            .add("V", "Vespertino")
            .add("N", "Noche");
    }

}

module.exports.Turnos = Turnos;