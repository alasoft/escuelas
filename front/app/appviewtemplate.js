class AppViewTemplate extends Template {

    extraConfiguration() {
        return {
            name: App.APP_NAME,
            fillContainer: true,
            orientation: "vertical",
            items: [this.title(),
                this.body()
            ]
        }
    }

    title() {
        return {
            name: App.TITLE_NAME,
            backgroundColor: App.BOX_BACKGROUND_COLOR,
            height: 45,
            orientation: "horizontal",
            items: [
                this.toolbar()
            ]
        }
    }

    toolbar() {
        return {
            name: App.TOOLBAR_NAME,
            marginTop: 5,
            marginLeft: 5,
        }
    }

    body() {
        return {
            name: App.BODY_NAME,
            fillContainer: true,
            orientation: "horizontal",
            margin: App.BOX_MARGIN,
            items: [
                this.itemsResizer(),
                this.view()
            ]
        }
    }

    itemsResizer() {
        return {
            name: App.ITEMS_RESIZER_NAME,
            orientation: "vertical",
            width: App.ITEMS_WIDTH,
            marginRight: App.BOX_MARGIN,
            items: [
                this.appItemsLabel(),
                this.appItems()
            ]
        }
    }

    appItemsLabel() {
        return {
            text: "Menú",
            marginBottom: App.LABEL_BOTTOM_MARGIN
        }
    }

    appItems() {
        return {
            name: App.ITEMS_NAME,
            fillContainer: true,
            orientation: "vertical",
            height: 0
        }
    }

    view() {
        return {
            name: App.VIEW_NAME,
            fillContainer: true,
            width: "70%",
            orientation: "vertical",
        }
    }

}