const Email = require("./email").Email;

new Email().sendTest()
    .then(info =>
        console.log(info))
    .catch(err =>
        console.log(err));