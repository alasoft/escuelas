class Strings{

    static Capitalize(s) {
        return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
    }   

    static FirstCharToUpper(s) {
        return s.charAt(0).toUpperCase() + s.substr(1);
    }   

}