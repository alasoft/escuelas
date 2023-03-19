class Messages {

    static EMAIL_INGRESADO_NO_CORRESPONDE = "El email ingresado no corresponde a ningún Usuario previamente<br>registrado."
    static POR_FAVOR_REGISTRESE = "Si Usted desea registrarse, presione 'ME QUIERO REGISTRAR'";
    static COMBINACION_EMAIL_PASSWORD_INCORRECTA = "La combinación de Email y Password, no es correcta."
    static POR_FAVOR_VERIFIQUE = "Por favor verifique sus datos.";
    static POR_FAVOR_VERIFIQUE_Y_VUELVA = "Por favor verifique sus datos y vuelva a ingresarlos.";

    static Build(p) {
        let message = "";
        Utils.ToArray(p).forEach(section => message += this.BuildSection(section));
        return message;
    }

    static BuildSection(p) {
        let section;
        if (p != undefined) {
            section = "<b>" + p.message + this.Detail(p)
        } else {
            section = "";
        }
        return section //+ Html.LineFeed(3);
    }

    static Detail(p) {
        return Html.LineFeed(Utils.IfNotDefined(p.lineFeed, 2)) +
            (p.detail != undefined ? Html.Tab(Utils.IfNotDefined(p.tab, 2)) +
                Strings.SingleQuotes(p.detail, p.quotes) : "");
    }

    static PorFavorVerifique(lineFeed = 0) {
        return Html.LineFeed(lineFeed) + this.POR_FAVOR_VERIFIQUE
    }


}