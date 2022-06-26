const { DataTypes } = require('sequelize')

module.exports = sequelize => {
    sequelize.define('categoria', {
        // id: {
        //     type: DataTypes.INTEGER,
        //     autoIncrement: true,
        //     primaryKey: true
        // },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
}