class ExamenesNotas extends NotasBase {

    extraConfiguration() {
        return {
            components: {
                list: {

                }
            }
        }
    }

    defineTemplate() {
        return new ExamenesNotasTemplate()
    }
}

class ExamenesNotasTemplate extends Template {

}