const { DataTypes, Sequelize } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('producto', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false
      //no está de más el allowNull si viene con defaultValue? sí XD
    },
    detalle: {
      //resumen
      type: DataTypes.TEXT,
      allowNull: true
    },
    cantidad: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imagen: {
      type: DataTypes.STRING,
      allowNull: true
    },
    marca: {
      type: DataTypes.STRING,
      allowNull: true
    },
    precio: {
      type: DataTypes.STRING,
      allowNull: false
    },
    disponible: {
      type: DataTypes.BOOLEAN
    }
  });
};




