const { MemoryTable } = require("../lib/data/memorytable");

class ExamenesTipos extends MemoryTable {

    addItems() {
        this.addItem({ id: "T", nombre: "Trabajo Práctico", fechaHasta: true })
            .addItem({ id: "O", nombre: "Evaluación Oral", fechaHasta: true })
            .addItem({ id: "E", nombre: "Examen Escrito", fechaHasta: false })
    }

}

module.exports.ExamenesTipos = ExamenesTipos;