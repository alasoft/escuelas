const { MemoryTable } = require("../lib/data/memorytable");

class AsistenciasTipo extends MemoryTable {

    addItems() {
        this.add(1, "Normal")
            .addItem({ id: -1, nombre: "Feriado", propaga: true })
            .add(-2, "Suspensión de Clases")
            .add(-3, "Enfermedad")
            .add(-4, "Falta");
    }

}

module.exports.AsistenciasTipo = AsistenciasTipo;