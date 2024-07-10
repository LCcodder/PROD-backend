const _country = require("./schemas/countryModel"),
    _user = require("./schemas/userModel"),
    _token = require("./schemas/tokenModel"),
    _friend = require("./schemas/friendModel"),
    _post = require("./schemas/postModel")

const modelsFactory = (sequelize) => {
    return {
        country: _country(sequelize),
        user: _user(sequelize),
        token: _token(sequelize),
        friend: _friend(sequelize),
        post: _post(sequelize)
    }
}

module.exports = {modelsFactory}