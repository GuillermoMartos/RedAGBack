const server = require('./app');
const { conn, Categoria } = require('./db');

// Syncing all the models at once.
//si pongo false en force, van quedando los datos en la db
//para correr el back junto con la api, podemos poner este puerto en 3002, p.e.
conn.sync({ force: false }).then(async () => {
  server.listen(3001, async () => {
    console.log('%s listening at 3001'); // eslint-disable-line no-console
  });


  // let apiDiet = ['Quesos', 'Dulces', 'Fiambres', 'Lácteos', 'Salsas', 'Picantes', 'Huevos', 'Aceites', 'Sales', 'Hongos', 'Comidas veganas', 'Pan y Masas', 'Legumbres', 'Baño y Limpieza', 'Plantas', 'Verduras', 'Otros']

  // const crear = await Categoria.bulkCreate(apiDiet.map(d => {
  //   return {
  //     nombre: d,
  //   }
  // }))
});
