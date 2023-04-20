const { MemoryTable } = require("../lib/data/memorytable");

class EvaluacionesTipos extends MemoryTable {

    addItems() {
        this.add("E", "Escrita")
            .add("O", "Oral")
            .add("T", "Trabajo Práctico")
    }


}

module.exports.EvaluacionesTipos = EvaluacionesTipos;