const { MemoryTable } = require("../lib/data/memorytable");

class EvaluacionesTipos extends MemoryTable {

    addItems() {
        this.addItem({ id: "T", nombre: "Trabajo Práctico", fechaHasta: true })
            .addItem({ id: "O", nombre: "Evaluación Oral", fechaHasta: true })
            .addItem({ id: "E", nombre: "Examen escrito", fechaHasta: false })
    }

}

module.exports.EvaluacionesTipos = EvaluacionesTipos;