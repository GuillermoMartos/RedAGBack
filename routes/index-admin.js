const express = require('express')
const server = express();
//me traigo los modelos para poder interactuar con mi db en los paths
const { Categoria, Producto, Persona } = require('../db');


server.use(express.json());

server.get('/categorias', async (req, res, next) => {


    const rta = await Categoria.findAll();

    res.json(rta);

})

server.get('/usuarios', async (req, res, next) => {
    const rta = await Persona.findAll();
    res.json(rta);
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
        console.log(i)
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


module.exports = server;