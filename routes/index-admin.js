const express = require('express')
const server = express();
//me traigo los modelos para poder interactuar con mi db en los paths
const { Categoria, Producto, Persona, Compra, Admin } = require('../db');


server.use(express.json());

server.get('/categorias', async (req, res, next) => {
    const rta = await Categoria.findAll();
    res.json(rta);
})

server.get('/usuarios', async (req, res, next) => {
    const rta = await Persona.findAll();
    res.json(rta);
})

server.post('/acceso', async (req, res, next) => {
    const { mail } = req.body
    let profile = await Admin.findOne({ where: { email: mail } });
    console.log(profile.nombre)
    res.status(200).send({ admin: true })
})

server.get('/getAdmins', async (req, res, next) => {
    try {
        let profile = await Admin.findAll();
        res.status(200).send(profile)
    }
    catch (error) {
        res.status(500).send({ messagge: 'error al buscar admins, reintente' })
    }
})

server.post('/hacer-admin', async (req, res, next) => {
    const { mail } = req.body
    try {
        let profile = await Persona.findOne({ where: { email: mail } });
        if (profile) {
            const nuevoAdmin = await Admin.create({
                email: mail
            })
            res.status(200).send({ admin: true })
        }
    }
    catch (error) {
        res.status(500).send({ messagge: 'error al buscar persona para admin o creando admin', error })
    }
    res.send(304).send({ messagge: 'la persona para hacer admin no tiene el mail registrado en BD' })
})

server.post('/crear', async (req, res, next) => {
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
})


server.get('/comprasTotalesPorCliente', async (req, res) => {
    compras = await Compra.findAll({
        order: [
            ['cliente', 'ASC']
        ],
    })
    res.status(200).send(compras)
})

module.exports = server;