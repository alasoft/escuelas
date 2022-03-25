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
        let userLogged = this.findOrCreate(user);
        userLogged.token = Utils.NewToken(this.app.tokenAlive);
        return this.userLoggedToClient(userLogged);
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
            tenant: user.tenant,
            rol: user.rol
        };
    }

    userLoggedToClient(userToken) {
        const { nombre, apellido, token } = userToken;
        return { nombre, apellido, token: token.value };
    }


    authenticate(req) {
        const userLogged = this.findByToken(req.headers.token)
        if (userLogged == undefined) {
            throw Exceptions.InvalidToken()
        }
        req.user = userLogged;
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