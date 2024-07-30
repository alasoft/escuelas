class Template {

    configuration(){

    }
    

    element(){
        if(this._element==undefined){
            this._element=this.defineElement();
        }
        return this._element;
    }

    defineElement(){
        return new TemplateItem(this.configuration())
    }

    html(){
        this.element()[0].outerHTML;
    }

}

class TemplateItem{

    constructor(configuration){
        this.configuration=configuration;
    }

    element(){
        const element = Dom.NewElement();
        element.addClass(this.configuration.name);
        element.css(this.styles());
        this.addChilds(element);
        return element;
    }

    styles(){
        const styles = {};
        Object.keys(this.configuration).forEach(
            key => {
                const functionName = "_"+Strings.FirstCharToUpper(key);
                if(TemplateStyles[functionName]!=undefined && typeof  TemplateStyles[functionName]=="function"){
                    Object.assign(styles,Template[functionName](this.configuration[key]))
                }
            }
        )
        return styles;
    }

    addChilds(element){
        this.items.forEach(item => 
            element.append(new TemplateItem(item).element()))
    }

}

class TemplateStyles{


    static _FillContainer(fillContainer) {
        if (fillContainer == true) {
            return {
                "flex": 1
            }
        }
    }

    static _Orientation(orientation) {
        if (Strings.EqualsIgnoreCase(orientation, "vertical")) {
            return {
                "display": "flex",
                "flex-direction": "column"
            }
        } else if (Strings.EqualsIgnoreCase(orientation, "horizontal")) {
            return {
                "display": "flex",
                "flex-direction": "row"
            }
        }
    }

    static _Margin(margin) {
        return {
            "margin": margin
        }
    }

    static _Padding(padding) {
        return {
            "padding": padding
        }
    }

    static _PaddingLeft(padding) {
        return {
            "padding-left": padding
        }
    }

    static _PaddingRight(padding) {
        return {
            "padding-right": padding
        }
    }

    static _PaddingTop(padding) {
        return {
            "padding-top": padding
        }
    }

    static _PaddingBottom(padding) {
        return {
            "padding-bottom": padding
        }
    }

}
