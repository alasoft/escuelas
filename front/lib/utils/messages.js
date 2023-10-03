class Messages {

    static EMAIL_INGRESADO_NO_CORRESPONDE = "El email ingresado, no corresponde a ningún Usuario previamente<br>registrado."
    static POR_FAVOR_REGISTRESE = "Si Usted desea registrarse, presione el botón 'Me quiero registrar'";
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
            section = "<br><b>" + p.message + this.Detail(p) + Html.LineFeed(Utils.IfNotDefined(p.skipSection, 1))
        } else {
            section = "";
        }
        return section;
    }

    static Detail(p) {

        function text(d) {
            return (d != undefined ? Html.Tab(Utils.IfNotDefined(p.tab, 2)) +
                Strings.SingleQuotes(d, p.quotes) : "");
        }

        let detail = "";

        Utils.ToArray(p.detail).forEach(d =>
            detail += (detail != "" ? "<br>" : "") + text(d));

        return Html.LineFeed(Utils.IfNotDefined(p.lineFeed, 2)) + detail;

    }

    static PorFavorVerifique(lineFeed = 0) {
        return Html.LineFeed(lineFeed) + this.POR_FAVOR_VERIFIQUE
    }


}