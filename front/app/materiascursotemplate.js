class MateriasCursoTemplate extends FilterViewTemplate {

    extraItems() {
        return super.extraItems().concat([this.toolbar()])
    }

    toolbar() {
        return {
            name: "toolbar"
        }
    }

}