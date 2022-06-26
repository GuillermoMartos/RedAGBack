const { DataTypes } = require('sequelize')

module.exports = sequelize => {
    sequelize.define('persona', {
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        activateLink: {
            type: DataTypes.STRING,
            default: "none",
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false,
        },
    })
}