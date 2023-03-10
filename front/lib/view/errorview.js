class ErrorView extends MessageView {

    isInternal() {
        return this.parameters().internal == true;
    }

    popupTitleDefault() {
        return this.isInternal() ? App.INTERNAL_ERROR_MESSAGE_TITLE : App.VALIDATION_MESSAGE_TITLE;
    }

    defineMessage() {
        return (this.isInternal() ? '<style="background-color: lightgrey"><i>' : "<b>") +
            this.parameters().message +
            (this.parameters().stack != undefined ? Html.LineFeed(3) + this.parameters().stack : "");
    }

}