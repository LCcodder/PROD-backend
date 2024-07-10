const {initRoutes} = require("./router/router"), 
    { authAndGetSequelize } = require("./database/authAndGetSequelize"),
    {modelsFactory} = require("./models/modelsFactory"),
    express = require("express"),
    {createTables} = require("./database/createTables")

const start = async (app, host, port, postgresUri) => {
    app.use(express.json())
    app.use(express.urlencoded({
        extended: true
    }))
    

    const sequelize = await authAndGetSequelize(postgresUri)
    await createTables(sequelize)
    const _models = modelsFactory(sequelize)

    initRoutes(app,sequelize,"sdfmsakldfjklsajfkalsjfaksljl")


    app.listen(port, host)
}

module.exports = {start}