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
        let admin = await Admin.findOne({ where: { email: mail } })
        if (admin) {
            for (profileMail of mailAdmin) {
                const nuevoAdmin = await Admin.create({
                    email: profileMail
                })
            }
            return res.status(200).send({ messagge: 'admins creados exitosamente' })
        }
        else res.status(403).send({ messagge: 'accion prohibida a no administradorxs' })
    }
    catch (error) {
        res.status(500).send({ messagge: 'error al buscar persona para admin o creando admin', error })
    }
})

server.post('/eliminar-admin', async (req, res, next) => {
    const { mail, mailAdmin } = req.body
    try {
        let admin = await Admin.findOne({ where: { email: mail } })
        if (admin) {
            for (profileMail of mailAdmin) {
                const nuevoAdmin = await Admin.destroy({
                    where: {
                        email: profileMail
                    }
                })
            }
            return res.status(200).send({ messagge: 'admins eliminados exitosamente' })
        }
        else res.status(403).send({ messagge: 'accion prohibida a no administradorxs' })
    }
    catch (error) {
        res.status(500).send({ messagge: 'error al buscar persona para admin o eliminando admin', error })
    }
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
                categoria } = await req.body

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

            // Asigno una Categor??a existente al Producto o la creo y la asigno
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

            // Devuelvo el nuevo producto creado con sus categor??as pertinentes
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

server.post('/borrarCompras', async (req, res) => {
    const { mail } = req.body
    try {
        let admin = await Admin.findOne({ where: { email: mail } })
        if (admin) {
            Compra.destroy({
                where: {},
                truncate: true
            })
            res.status(200).send({})
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
                res.status(500).send({ messagge: 'error en el proceso de update' })
            }
        }
        else res.status(403).send({ messagge: 'accion prohibida para no administradorxs' })
    }
    catch (error) {
        errorHandlerMailer(error, 'UPDATE PRODUCTOS')
        res.status(500).send({ messagge: 'error en el proceso principal de update', error })
    }
})

server.post('/eliminarProd', async (req, res) => {
    const { mail, id } = req.body
    console.log('mail:', mail, 'id:', id)
    try {
        let admin = await Admin.findOne({ where: { email: mail } })
        if (admin) {
            try {
                const count = await Producto.destroy({ where: { id: id } });
                console.log(`deleted row(s): ${count}`);
                res.status(200).send({ messagge: 'DB actualizada!' })
            } catch (err) {
                errorHandlerMailer(err, 'ELIMINAR PROD')
                res.status(500).send({ messagge: 'error en el proceso de eliminarProd' })
            }
        }
        else res.status(403).send({ messagge: 'accion prohibida para no administradorxs' })
    }
    catch (error) {
        errorHandlerMailer(error, 'ELIMINAR PROD')
        res.status(500).send({ messagge: 'error en el proceso principal de eliminarProd', error })
    }
})

module.exports = server;