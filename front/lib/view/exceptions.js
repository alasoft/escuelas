class Exception {

    static TYPE_INTERNAL = "internal";
    static TYPE_VALIDATION = "validation";

    constructor(parameters = {}) {
        this.message = parameters.message;
    }

}

class NotImplementedException extends Exception {

    constructor(parameters) {
        super(parameters);
        this.type = Exception.TYPE_INTERNAL;
    }

}

class ValidationException extends Exception {

    constructor(parameters) {
        super(parameters);
        this.type = Exception.TYPE_VALIDATION;
    }

}