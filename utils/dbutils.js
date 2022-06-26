const CryptoJS = require('crypto-js')
const nodemailer = require("nodemailer");

//usarlo en el create del usuario, pasarle su pass de body
//y en el log in para chequear el mismo con lo que ya estará en db del user
const encrypt = (pass) => {
    var crypted = CryptoJS.SHA3(pass, { outputLength: 224 });
    crypted = crypted.toString();
    return crypted;
};

const mailer = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "rocket.app.mailing@gmail.com",
        pass: "giyzvxygygnzxyld", // pass oculta que nos ofrece gmail
    },
});

module.exports = {
    encrypt,
    mailer
}