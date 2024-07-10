const {Sequelize} = require('sequelize')

const authAndGetSequelize = async (uri) => {
    try {
        const sequelize = new Sequelize(uri)
        await sequelize.authenticate()
        return sequelize
    } catch(_) {
        console.log(_)
        console.log("Unable to connect...")
        return null
    }
}

module.exports = {authAndGetSequelize}