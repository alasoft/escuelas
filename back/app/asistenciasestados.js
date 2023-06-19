const { MemoryTable } = require("../lib/data/memorytable");

class AsistenciasEstados extends MemoryTable {

    static ESTADO_NORMAL = 1;

    addItems() {
        this.add(this.class().ESTADO_NORMAL, "Normal")
            .addItem({ id: -1, nombre: "Feriado", propaga: true })
            .add(-2, "Suspensión de Clases")
            .add(-3, "Enfermedad")
            .add(-4, "Falta");
    }

}

module.exports.AsistenciasEstados = AsistenciasEstados;