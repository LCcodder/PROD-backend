const DataTypes = require("sequelize").DataTypes

module.exports = (sequelize) => {
    return sequelize.define('users', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        login: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        email: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        countryCode: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        phone: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, 
        {
            sequelize,
            tableName: "users",
            schema: "public",
            timestamps: false
        }
    )
}

