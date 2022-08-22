const express = require('express')
const server = express();
//me traigo los modelos para poder interactuar con mi db en los paths
const { Categoria, Producto, Persona, Compra, Admin } = require('../db');


server.use(express.json());

async function errorHandlerMailer(error, seccion) {
    let info = await mailer.sendMail({
        from: '"Compras Comunitarias" <guille.l.martos@gmail.com>', // sender address
        to: `guille.l.martos@gmail.com`, // list of receivers
        subject: `${seccion}: Error inesperado en Compras Comunitarias`, // Subject line
        text: `error en Compras Comnitarias inesperado`, // plain text body
        html: `<div style='height:450px; width:450px; background:linear-gradient(43deg, #18e, #92e); margin:auto; padding: 25px; box-sizing:border-box; border-radius:30px'>
              
                <h1 style="margin:auto; text-align:center; color:white; font-family:verdana; font-style: italic">COMPRAS COMUNITARIAS</h1>
                
                <p style="margin:auto; text-align:center; margin-top: 30px">
                    error en ${seccion}:
                        ${error}
                </p>
            </div>
                `,
    });
}

server.get('/categorias', async (req, res, next) => {
    const rta = await Categoria.findAll();
    res.json(rta);
})

server.post('/usuarios', async (req, res, next) => {
    const { mail } = req.body
    try {
        let admin = await Admin.findOne({ where: { email: mail } });
        if (admin) {
            const rta = await Persona.findAll();
            res.status(200).send(rta);
        }
        else res.status(403).send({ messagge: 'accion prohibida para no administradorxs' })
    }
    catch (error) {
        res.status(500).send({ messagge: 'error al buscar admin, reintente' })
    }
})

server.post('/acceso', async (req, res, next) => {
    const { mail } = req.body
    try {
        let admin = await Admin.findOne({ where: { email: mail } });
        if (admin) res.status(200).send({ admin: true })
        else res.status(403).send({ messagge: 'accion prohibida para no administradorxs' })
    }
    catch (error) {
        res.status(500).send({ messagge: 'error al buscar admin, reintente' })
    }
})

server.post('/getAdmins', async (req, res, next) => {
    const { mail } = req.body
    try {
        let admin = await Admin.findOne({ where: { email: mail } })
        if (admin) {

            let profile = await Admin.findAll();
            res.status(200).send(profile)
        }
        else res.status(403).send({ messagge: 'accion prohibida para no administradorxs' })
    }
    catch (error) {
        res.status(500).send({ messagge: 'error al buscar admins, reintente' })
    }
})

server.post('/hacer-admin', async (req, res, next) => {
    const { mail, mailAdmin } = req.body
    try {
        let admin = await Admin.findOne({ where: { email: mailAdmin } })
        if (admin) {
            let profile = await Persona.findOne({ where: { email: mail } });
            if (profile) {
                const nuevoAdmin = await Admin.create({
                    email: mail
                })
                res.status(200).send({ admin: true })
            }
            else res.status(403).send({ messagge: 'accion prohibida la persona que se intenta asignar no tiene el mail registrado en BD' })
        }
        else res.status(403).send({ messagge: 'accion prohibida a no administradorxs' })
    }
    catch (error) {
        res.status(500).send({ messagge: 'error al buscar persona para admin o creando admin', error })
    }
    res.status(304).send({ messagge: 'la persona para hacer admin no tiene el mail registrado en BD' })
})

server.post('/crear', async (req, res, next) => {
    const { mail } = req.body
    try {
        let admin = await Admin.findOne({ where: { email: mail } })
        if (admin) {
            const { nombre,
                detalle,
                imagen,
                marca,
                precio,
                disponible,
                cantidad,
                categoria } = req.body

            //Creo el nuevo Producto
            const nuevoProducto = await Producto.create({
                nombre,
                precio,
                cantidad,
                disponible,
                detalle: detalle ? detalle : null,
                imagen: imagen ? imagen : null,
                marca: marca ? marca : null,
                disponible: disponible ? disponible : null,
            })

            // Asigno una Categoría existente al Producto o la creo y la asigno
            for (let i of categoria) {
                // console.log(i)
                const categorizacion = await Categoria.findOne({
                    where: {
                        nombre: i
                    }
                }).then(async function (user) {
                    if (!user) {
                        let nuevo = await Categoria.create({
                            nombre: i
                        })
                        await nuevoProducto.addCategoria(nuevo);
                    }
                    await nuevoProducto.addCategoria(user);
                });

            }

            // Devuelvo el nuevo producto creado con sus categorías pertinentes
            const rta = await Producto.findAll({
                where: {
                    id: nuevoProducto.id
                },
                include: {
                    model: Categoria,
                    attributes: ['nombre'],
                    through: { attributes: [] }
                }
            })
            res.json(rta)
        }
        else res.status(403).send({ messagge: 'accion prohibida para no administradorxs' })
    }
    catch (error) {
        res.status(500).send({ messagge: 'error creando producto', error })
    }
})


server.post('/comprasTotalesPorCliente', async (req, res) => {
    const { mail } = req.body
    try {
        let admin = await Admin.findOne({ where: { email: mail } })
        if (admin) {
            compras = await Compra.findAll({
                order: [
                    ['cliente', 'ASC']
                ],
            })
            res.status(200).send(compras)
        }
        else res.status(403).send({ messagge: 'accion prohibida para no administradorxs' })
    }
    catch (error) {
        res.status(500).send({ messagge: 'error trayendo compras', error })
    }
})

server.post('/editar-productos', async (req, res) => {
    const { mail, productos } = req.body
    try {
        let admin = await Admin.findOne({ where: { email: mail } })
        if (admin) {
            try {
                productos.map(async el => {
                    await Producto.update({
                        nombre: el.nombre,
                        detalle: el.detalle,
                        cantidad: el.cantidad,
                        imagen: el.imagen,
                        marca: el.marca,
                        precio: el.precio,
                        disponible: el.disponible
                    }, {
                        where: {
                            id: el.id
                        }
                    });
                })
                res.status(200).send({ messagge: 'DB actualizada!' })
            } catch (err) {
                errorHandlerMailer(err, 'UPDATE PRODUCTOS')
            }
        }
        else res.status(403).send({ messagge: 'accion prohibida para no administradorxs' })
    }
    catch (error) {
        res.status(500).send({ messagge: 'error trayendo compras', error })
    }
})

module.exports = server;