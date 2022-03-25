class Strings {

    static Concatenate(array, separator = " ") {
        return array
            .filter(item => Utils.IsDefined(item))
            .join(separator);
    }

}