const { ObjectBase } = require("../utils/objectbase");
const { Utils } = require("../utils/utils");

class MemoryTable extends ObjectBase {

    items() {
        if (this._items == undefined) {
            this.defineItems();
        }
        return this._items;
    }

    defineItems() {
        this._items = [];
        this.addItems();
    }

    addItems() { }

    addItem(item) {
        this._items.push(item);
        return this;
    }

    add(id, nombre) {
        return this.addItem({ id, nombre })
    }

    list(name) {
        if (name == undefined) {
            return this.items()
        } else {
            return this.items().filter(
                item => Utils.Contains(item.id + item.nombre, name)
            )
        }
    }

    get(id) {
        return this.items().find(
            item => item.id == id
        )
    }

    getNombre(id) {
        const item = this.get(id);
        if (item != undefined) {
            return item.nombre
        }
    }

    getId(nombre) {
        const item =
            this._items.find(
                items => item.nombre = nombre
            )
        if (item != undefined) {
            return item.id;
        }
    }

    static Items() {
        return this.Instance().items();
    }

    static GetNombre(id) {
        return this.Instance().getNombre(id);
    }

    static GetId(nombre) {
        return this.Instance().getId(nombre);
    }

}

module.exports.MemoryTable = MemoryTable;