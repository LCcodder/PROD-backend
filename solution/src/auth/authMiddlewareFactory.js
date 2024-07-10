'use strict'
const jwt = require("jsonwebtoken")

const authMiddlewareFactory = (secret, model) => {
    this.__secret = secret
    this.__model = model
    return async (req, res, next) => {
        try {
            
            const authHeader = req.header("Authorization")
    
            if (!authHeader || 
                !authHeader.startsWith("Bearer ") ||
                !authHeader.replace("Bearer ", "")
            ) {
                return res.status(401).json({
                    reason: "Wrong auth header"
                })
            }
    
            const token = authHeader.replace("Bearer ", "")

            jwt.verify(token, this.__secret)
            
            const findedToken = await this.__model.findOne({
                where: {
                    token: token
                }
            })

            if (!findedToken) throw new Error("Token has not been found")

            next()
        } catch(_error) {
            // console.log(_error)
            return res.status(401).json({
                reason: "Invalid auth token"
            })
        }
    }
}
module.exports = {authMiddlewareFactory}