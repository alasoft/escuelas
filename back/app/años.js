const { MemoryTable } = require("../lib/data/memorytable")

class Años extends MemoryTable {

    addItems() {
        this.add(1, "1er")
            .add(2, "2do")
            .add(3, "3er")
            .add(4, "4to")
            .add(5, "5to")
            .add(6, "6to");
    }

}

module.exports.Años = Años;