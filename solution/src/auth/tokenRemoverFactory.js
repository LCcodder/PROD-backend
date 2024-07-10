const tokenRemoverFactory = (model) => {
    this.__model = model
    
    return async (login) => {
        await this.__model.destroy({
            where: {
                login: login
            }
        })
    } 
}
module.exports = {tokenRemoverFactory}