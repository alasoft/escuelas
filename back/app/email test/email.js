const nodemailer = require("nodemailer");

class Email {

    sendTest() {


        const transporterOutlook = nodemailer.createTransport({
            host: "smtp-mail.outlook.com",
            //                                secureConnection: false,
            port: 587,
            //                service: "Outlook365",
            auth: {
                //                type: "login",
                user: "robertoalaluf@hotmail.com",
                pass: "petalosderosa19A"
            },
            tls: {
                //                rejectUnauthorized: false,
                tls: "SSLv3"
            },
        })

        transporterOutlook.verify((error, success) => {
            if (error) {
                console.log(error)
            } else {
                console.log(success)
            }
        })

        return transporterOutlook.sendMail({
            from: "robertoalaluf@hotmail.com",
            to: "robertoalaluf@gmail.com",
            subject: "Hola !",
            text: "Que tal ? ..",
            html: "<p>Hello</p><b>Hi !</b>"
        })

    }


}

module.exports.Email = Email;