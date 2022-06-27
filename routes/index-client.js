const express = require('express')
const server = express();
//me traigo los modelos para poder interactuar con mi db en los paths
const { Categoria, Persona } = require('../db');
const { encrypt, mailer } = require('../utils/dbutils')

server.use(express.json());


server.get('/categorias', async (req, res, next) => {


    const rta = await Categoria.findAll();

    res.json(rta);

})


server.post("/registrar", async (req, res) => {

    var { password, email, name } = req.body;

    var crypted = encrypt(password);
    var emailCript = encrypt(email);
    console.log(password, email, name, crypted, emailCript)
    try {
        let user = await Persona.findOne({ where: { email: req.body.email } });
        if (!req.body.password || !req.body.name || !req.body.email) {
            res.send({ faltanDatos: "Los inputs requeridos son name, email, password " });
        } else if (user) {
            res.send({ repetido: "El mail ya está registrado" });
        } else {
            var newProfile = await new Persona({
                nombre: name,
                email,
                password: crypted,
                activateLink: emailCript,
                active: false
            });

            await newProfile.save();
            try {
                let info = await mailer.sendMail({
                    from: '"Compras Comunitarias" <guille.l.martos@gmail.com>', // sender address
                    to: `${email}`, // list of receivers
                    subject: "Confirmar registro Compras Comunitarias ✔", // Subject line
                    text: `confirmar con el siguiente código: ${emailCript}`, // plain text body
                    html: `<div style='height:450px; width:450px; background:linear-gradient(43deg, #18e, #92e); margin:auto; padding: 25px; box-sizing:border-box; border-radius:30px'>
              
                <h1 style="margin:auto; text-align:center; color:white; font-family:verdana; font-style: italic">COMPRAS COMUNITARIAS</h1>
                
                <div style="width:100%; text-align:center; margin-top:30px">
                <img src="https://i0.wp.com/diariosanrafael.com.ar/wp-content/uploads/2021/05/feria-goudge.jpg?fit=1024%2C1024&ssl=1"
                     style="width: 60%">
                  </div>
                
                <h3 
                    style="margin:auto; text-align:center; margin-top: 30px">
                  <a href="http://localhost:3000/active-account/${emailCript}" target="_BLANK" 
                     style='cursor:pointer; color:white; font-family:verdana; text-decoration:none'>Gracias por registrarte!<br>Hacé click <span style="text-decoration:underline">ACÁ</span> para confirmar el registro!</a></h3>
                `,
                });
                console.log("mail saxesfuli sent");
            } catch (error) {
                let info = await mailer.sendMail({
                    from: '"Compras Comunitarias" <guille.l.martos@gmail.com>', // sender address
                    to: 'guille.l.martos@gmail.com', // list of receivers
                    subject: "error en Compras Comunitarias inesperado ✔", // Subject line
                    text: `error en Compras Comnitarias inesperado`, // plain text body
                    html: `<div style='height:450px; width:450px; background:linear-gradient(43deg, #18e, #92e); margin:auto; padding: 25px; box-sizing:border-box; border-radius:30px'>
              
                <h1 style="margin:auto; text-align:center; color:white; font-family:verdana; font-style: italic">COMPRAS COMUNITARIAS</h1>
                
                <div style="width:100%; text-align:center; margin-top:30px">
                <img src="https://i0.wp.com/diariosanrafael.com.ar/wp-content/uploads/2021/05/feria-goudge.jpg?fit=1024%2C1024&ssl=1"
                     style="width: 60%">
                  </div>
                
                <p 
                    style="margin:auto; text-align:center; margin-top: 30px">
                    error en el REGISTRO:
                        ${error}
                     </p>
                `,
                });
                res.send({ error: "algo salió mal, por favor contactarse" });
            }
            res.send(newProfile);
        }
    } catch (err) {
        res.send({ error: "algo salió mal, por favor contactarse" });
    }


});


//Ingresar
server.post("/ingreso", async (req, res) => {
    let { email, password } = req.body;
    console.log(encrypt(password))

    try {
        console.log('llega?')
        let profile = await Persona.findOne({ where: { email: email.toLowerCase() } });
        console.log('llega aun?')

        if (!profile) {
            console.log("El mail no corresponde con usuarios en la DB")
            return res.send({ notFound: "El mail no corresponde con usuarios en la DB", email });
        }
        if (profile.active === false) {
            console.log("se debe confirmar la cuenta para entrar (ver mail)")
            return res.json({ account: "se debe confirmar la cuenta para entrar (ver mail)", email });
        }
        if (encrypt(password) == profile.password) {
            console.log('todo ok, logeado:', profile)
            return res.send(profile);
        }
        if (encrypt(password) !== profile.password) {
            console.log(profile.password, 'no coincide ')
            res.send({ badPassword: "tu contraseña no es la correcta" })
        }
        console.log('todo ok, logeado:', profile)
        res.send(profile)
    } catch (error) {
        console.log('error', error)
        let info = await mailer.sendMail({
            from: '"Compras Comunitarias" <guille.l.martos@gmail.com>', // sender address
            to: 'guille.l.martos@gmail.com', // list of receivers
            subject: "error en Compras Comunitarias inesperado ✔", // Subject line
            text: `error en Compras Comnitarias inesperado`, // plain text body
            html: `<div style='height:450px; width:450px; background:linear-gradient(43deg, #18e, #92e); margin:auto; padding: 25px; box-sizing:border-box; border-radius:30px'>
      
        <h1 style="margin:auto; text-align:center; color:white; font-family:verdana; font-style: italic">COMPRAS COMUNITARIAS</h1>
        
        <div style="width:100%; text-align:center; margin-top:30px">
        <img src="https://i0.wp.com/diariosanrafael.com.ar/wp-content/uploads/2021/05/feria-goudge.jpg?fit=1024%2C1024&ssl=1"
             style="width: 60%">
          </div>
        
        <p 
            style="margin:auto; text-align:center; margin-top: 30px">
            error en el LOGIN:
                ${error}
             </p>
        `,
        });
        res.send({ error: "algo salió mal, por favor contactarse" });
    }
});

//Busqueda Persona por pass para activar x mailing
server.get("/searchProfileActivate/:active", async (req, res) => {
    let { active } = req.params;


    Persona.update(
        { active: true },
        { where: { activateLink: active } }
    )
        .then(result =>
            console.log(result)
        )
        .catch(err =>
            console.log(err)
        )
    let profile = await Persona.findOne({ where: { activateLink: active } });

    res.send(profile);
});


module.exports = server;
