const jwt = require("jsonwebtoken")

const tokenGeneratorFactory = (secret, model) => {
    this.__secret = secret
    this.__model = model

    return async (login, password) => {
        const token = jwt.sign({
            login: login,
            password: password
        }, this.__secret, { expiresIn: '24h'})

        const findedToken = await this.__model.findOne({
            where: {
                token: token
            }
        })
        if (!findedToken) {
            const newToken = await this.__model.create({
                token: token,
                login: login
            })
            
            await newToken.save()
        }
        return token
    }
}

module.exports = {tokenGeneratorFactory}