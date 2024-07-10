const DataTypes = require("sequelize").DataTypes

module.exports = (sequelize) => {
    return sequelize.define('tokens', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        login: {
            type: DataTypes.TEXT,
            allowNull: false 
        },
    },
        
        {
            sequelize,
            tableName: "tokens",
            schema: "public",
            timestamps: false
        }
    )
}