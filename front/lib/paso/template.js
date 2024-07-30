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

    static _Margin(margin) {
        return {
            "margin": margin
        }
    }

}
