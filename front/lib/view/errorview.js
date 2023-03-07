class ErrorView extends MessageView {

    isInternal() {
        return this.parameters.internal == true;
    }

    popupTitleDefault() {
        return this.isInternal() ? App.INTERNAL_ERROR_MESSAGE_TITLE : App.ERROR_MESSAGE_TITLE;
    }

    defineMessage() {
        return Html.Italic() + (this.isInternal() ? Html.BoldWithStyle("background-color: lightyellow") : Html.Bold()) +
            this.parameters.message +
            (this.parameters.stack != undefined ? Html.LineFeed(3) + this.parameters.stack : "");
    }

}