const server = require('./app');
const { conn, Categoria, Admin } = require('./db');
const port = process.env.PORT || 3001;
// Syncing all the models at once.
//si pongo false en force, van quedando los datos en la db
//para correr el back junto con la api, podemos poner este puerto en 3002, p.e.
conn.sync({ force: false }).then(async () => {
  server.listen(port, async () => {
    console.log(port); // eslint-disable-line no-console
  });
  //funcion para hacer un admin si se quiere resetear la BD
  // await Admin.create({ email: 'guille.l.martos@gmail.com' })


  //esta funcion comentada es para crear todas las categorias
  // let categoriasIniciales = ['Quesos', 'Dulces', 'Fiambres', 'Lácteos', 'Salsas', 'Picantes', 'Huevos', 'Aceites', 'Sales', 'Hongos', 'Comidas veganas', 'Pan y Masas', 'Legumbres', 'Baño y Limpieza', 'Plantas', 'Verduras', 'Otros']

  // const crear = await Categoria.bulkCreate(categoriasIniciales.map(d => {
  //   return {
  //     nombre: d,
  //   }
  // }))
});
