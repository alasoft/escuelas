const { Dates } = require("../utils/dates");
const { Exceptions } = require("../utils/exceptions");
const { Utils } = require("../utils/utils");

class UsersLogged {

    usersLogged = new Map();

    constructor(parameters) {
        this.parameters = parameters;
        this.app = parameters.app;
    }

    newToken(user) {
        const userLogged = this.findOrCreate(user);
        userLogged.token = Utils.NewToken(this.app.tokenMinutes);
        const { nombre, apellido, email, rol, token } = userLogged;
        return { id: user.id, nombre, apellido, email, rol, token: token.value }
    }

    findOrCreate(user) {
        let userLogged = this.usersLogged.get(user.id);
        if (userLogged == undefined) {
            userLogged = this.newUserLogged(user);
            this.usersLogged.set(user.id, userLogged);
        }
        return userLogged;
    }

    newUserLogged(user) {
        return {
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            tenant: user.tenant,
            rol: user.rol
        };
    }

    authenticate(req) {
        const userLogged = this.findByToken(req.headers.token)
        if (userLogged == undefined) {
            throw Exceptions.InvalidToken()
        }
        req._user = userLogged;
    }

    findByToken(tokenValue) {
        for (const userLogged of this.usersLogged.values()) {
            const token = userLogged.token;
            if (token.value == tokenValue && Dates.LowerOrEqual(Dates.Now(), token.until)) {
                return userLogged;
            }
        }
    }

}

module.exports.UsersLogged = UsersLogged;