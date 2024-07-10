const DataTypes = require("sequelize").DataTypes

module.exports = (sequelize) => {
    return sequelize.define('posts', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        postId: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        author: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false
        },
        createdAt: {
            type: DataTypes.TIME,
            allowNull: false
        },
        likes: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false
        },
        dislikes: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false
        }

    },
        {
            sequelize,
            tableName: "posts",
            schema: "public",
            timestamps: false
        }
    )
}