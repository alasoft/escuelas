const { MemoryTable } = require("../lib/data/memorytable");

class PeriodosEstados extends MemoryTable {

    addItems() {
        this.addItem({ id: "A", nombre: "Abierto", fechaHasta: true })
            .addItem({ id: "C", nombre: "Cerrado", fechaHasta: true })
    }

}

module.exports.PeriodosEstados = PeriodosEstados;