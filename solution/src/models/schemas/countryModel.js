const DataTypes = require("sequelize").DataTypes

module.exports = (sequelize) => {
    return sequelize.define('countries', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        alpha2: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        alpha3: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        region: {
            type: DataTypes.TEXT,
            allowNull: false
        }}, {
            sequelize,
            tableName: "countries",
            schema: "public",
            timestamps: false
        }
    )
}