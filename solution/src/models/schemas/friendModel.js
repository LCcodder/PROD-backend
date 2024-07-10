const DataTypes = require("sequelize").DataTypes

module.exports = (sequelize) => {
    return sequelize.define('friends', {
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
        subscribedTo: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        addedAt: {
            type: DataTypes.TIME,
            allowNull: false
        }
    }, 
        {
            sequelize,
            tableName: "friends",
            schema: "public",
            timestamps: false
        }
    )
}