const { ObjectBase } = require("./objectbase");
const { Utils } = require("./utils");

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

    addItems() {}

    add(id, nombre) {
        this._items.push({ id: id, nombre: nombre });
        return this;
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

}

module.exports.MemoryTable = MemoryTable;