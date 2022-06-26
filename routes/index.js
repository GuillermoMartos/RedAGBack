const express = require('express');
const { Categoria, Producto } = require('../db');
const ClientRoutes = require('./index-client');
const AdminRoutes = require('./index-admin')



const router = express.Router();

//habilito el uso de jsons en mis rutas
router.use(express.json());

router.get('/landing', async (req, res) => {
    productos = await Producto.findAll({
        include: {
            model: Categoria,
            attributes: ['nombre']
        }
    })
    categorias = await Categoria.findAll()
    res.status(200).send({ productos, categorias })
})

router.use('/client', ClientRoutes);
router.use('/admin', AdminRoutes);


module.exports = router;
