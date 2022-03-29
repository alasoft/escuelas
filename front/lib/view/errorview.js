class ErrorView extends MessageView {

    title() {
        if (this.parameters().isValidation) {
            return "Atención"
        } else {
            return "Error interno"
        }
    }

}