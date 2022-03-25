const { MemoryTable } = require("../lib/data/memorytable")

class Años extends MemoryTable {

    addItems() {
        this.add(1, "Primero")
            .add(2, "Segundo")
            .add(3, "Tercero")
            .add(4, "Cuarto")
            .add(5, "Quinto")
            .add(6, "Sexto");
    }

}

module.exports.Años = Años;