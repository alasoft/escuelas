class Templates {

    static Empty() {
        return new TemplateBuilder()
            .root()
            .build();
    }

    static AppItems() {
        return new TemplateBuilder()
            .root("-fill -vertical-0 -padding-10 -padding-right-0")
            .add("label -margin-bottom-5")
            .add("treeItems -fill -vertical-0")
            .build();
    }

    static ListView() {
        return new TemplateBuilder()
            .root("-fill -vertical-0 -padding-10")
            .add("label -margin-bottom-5")
            .add("list -fill -vertical-0")
            .add("contextMenu")
            .build();
    }

    static ListWithFilterView() {
        return new TemplateBuilder()
            .root("-fill -vertical-0 -padding-10")
            .add("label -margin-bottom-5")
            .addChild("-whitesmoke")
            .add("filter -padding-left-15 -padding-top-15")
            .up()
            .add("list -fill -vertical-0")
            .add("contextMenu")
            .build();
    }

    static ListWithFilterToolbarView() {
        return new TemplateBuilder()
            .root("-fill -vertical-0 -padding-10")
            .add("label -margin-bottom-5")
            .addChild("-whitesmoke")
            .add("filter -padding-left-15 -padding-top-15 -margin-bottom--10")
            .up()
            .add("list -fill -vertical-0")
            .add("contextMenu")
            .add("toolbar -lightsteelblue -padding-top-10")
            .build();
    }

    static DialogView() {
        return new TemplateBuilder()
            .root("-vertical -fill -whitesmoke")
            .add("toolbar -padding-10")
            .build();
    }

    static EntryView() {
        return new TemplateBuilder()
            .root("-vertical -fill -whitesmoke")
            .add("form -fill -padding-15")
            .add("toolbar -padding-10")
            .build();
    }

    static MessageView() {
        return new TemplateBuilder()
            .root("-vertical -fill -whitesmoke")
            .add("text -fill -padding-15 -font-message")
            .add("toolbar -padding-10")
            .build();
    }

}