const bcrypt = require('bcrypt'),
    jwt = require("jsonwebtoken"),
    { normalizeProfile } = require('../utils/normalizeUserProfile')

class UserController {
    #userModel
    #tokenGenerator
    #tokenRemover
    #sequelize
    #friendModel

    constructor (sequelize, tokenGenerator, tokenRemover) {
        this.#userModel = sequelize.model('users')
        this.#friendModel = sequelize.model('friends')
        this.#sequelize = sequelize
        this.#tokenGenerator = tokenGenerator
        this.#tokenRemover = tokenRemover
    }

    addNewUser = async (req, res) => {
        try {
            let registrationData = req.body

            const findedUserByEmail = registrationData["email"] ? await this.#userModel.findOne({
                where: {
                    email: registrationData["email"]
                }
            }) : false

            const findedUserByLogin = registrationData["login"] ? await this.#userModel.findOne({
                where: {
                    email: registrationData["login"]
                }
            }) : false

            const findedUserByPhone = registrationData["phone"] ? await this.#userModel.findOne({
                where: {
                    email: registrationData["phone"]
                }
            }) : false

            if (Boolean(findedUserByEmail) + Boolean(findedUserByLogin) + Boolean(findedUserByPhone) > 0) {
                return res.status(409).json({
                    reason: "Given data is not unique to registrate"
                })
            }

            const unhashedPassword = registrationData["password"]
            registrationData["password"] = await bcrypt.hash(registrationData["password"], 10)


            const newUser = await this.#userModel.create(registrationData)
            await newUser.save()
            
            delete registrationData["password"]

            return res.status(201).json({
                profile: registrationData
            })

        } catch (_error) {
            console.log(_error)
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    authUserAndGetToken = async (req, res) => {
        try {
            const credentials = req.body

            const findedUser = await this.#userModel.findOne({
                where: {
                    login: credentials["login"]
                }
            })
            if (!findedUser) {
                return res.status(401).json({
                    reason: `User with login: ${credentials["login"]} does not exists`
                })
            }

            const isPasswordValid = await bcrypt.compare(credentials["password"], findedUser["password"])
            if (!isPasswordValid) {
                return res.status(401).json({
                    reason: "Password is incorrect"
                })
            }

            const token = await this.#tokenGenerator(
                credentials["login"], credentials["password"]
            )

            return res.status(200).json({
                token: token
            })

            
        } catch (_error) {

            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    getProfileByDecodedToken = async (req, res) => {
        try {
            // will not throw error, 'cuz it was authorized in middleware before :P
            const token = req.header("Authorization").replace("Bearer ", "")

            const decodedCredentials = jwt.decode(token)

            let findedUser = await this.#userModel.findOne({
                where: {
                    login: decodedCredentials["login"]
                },
                attributes: {
                    exclude: ["id", "password"]
                }
            })

            if (!findedUser) {
                return res.status(401).json({
                    reason: "Decoded token credentials is invalid"
                })
            }
            findedUser = findedUser.dataValues

            normalizeProfile(findedUser)
            return res.status(200).json(findedUser)
            
        } catch (_error) {
            console.log(_error)
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    editProfileByDecodedToken = async (req, res) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "")
            const login = jwt.decode(token)["login"]
            

            const updateData = req.body
            
            
            await this.#userModel.update(
                updateData,
                {
                    where: {
                        login: login
                    },
                    limit: 1
                }
            )


            let updatedProfile = await this.#userModel.findOne({
                where: {
                    login: login
                },
                attributes: {
                    exclude: ["id", "password"]
                }
                
            })

            updatedProfile = updatedProfile.dataValues
            normalizeProfile(updatedProfile)

            return res.status(200).json(updatedProfile)
        } catch (_error) {

            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    updatePasswordByDecodedToken = async (req, res) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "")
            const login = jwt.decode(token)["login"]

            const passwords = req.body

            const findedUser = await this.#userModel.findOne({
                where: {
                    login: login
                }
            })
            if (!findedUser) {
                return res.status(401).json({
                    reason: "Decoded token credentials is invalid"
                })
            }

            const isOldPasswordValid = await bcrypt.compare(passwords["oldPassword"], findedUser["password"])
            if (!isOldPasswordValid) {
                return res.status(403).json({
                    reason: "Old password is incorrect"
                })
            }

            const newHashedPassword = await bcrypt.hash(passwords["newPassword"], 10)
            await this.#userModel.update(
                {
                    password: newHashedPassword
                },
                {
                    where: {
                        login: login
                    },
                    limit: 1
                }
            )
            await this.#tokenRemover(login)

            return res.status(200).json({
                success: "ok"
            })

        } catch (_error) {
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    getUserProfile = async (req, res) => {
        try {
            const requestedLogin = req.params.login
            const token = req.header("Authorization").replace("Bearer ", "")
            const currentUserLogin = jwt.decode(token)["login"]
            
            let findedProfile = await this.#userModel.findOne({
                where: {
                    login: requestedLogin,
                },
                attributes: {
                    exclude: ["id", "password"]
                }
            })
            
            if(!findedProfile) {
                return res.status(403).json({
                    reason: "Unable to find requested user"
                })
            }
            findedProfile = findedProfile.dataValues

            if (!findedProfile["isPublic"]) {
                let findedFriend = await this.#friendModel.findOne({
                    where: {
                        login: requestedLogin,
                        subscribedTo: currentUserLogin
                    }
                })
                if(!findedFriend) {
                    return res.status(403).json({
                        reason: "Unable to find requested user"
                    })
                }
                normalizeProfile(findedProfile)
                return res.status(200).json(findedProfile)
            } else {
                normalizeProfile(findedProfile)
                return res.status(200).json(findedProfile)
            }

        } catch (_error) {
            console.log(_error)
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    getFriends = async (req, res) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "")
            const login = jwt.decode(token)["login"]
            const limit = req.query["limit"]
            const offset = req.query["offset"]

            let friends = await this.#friendModel.findAll({
                limit: limit,
                offset: offset,
                where: {
                    login: login
                },
                order: [
                    ['addedAt', 'DESC']
                ],
                attributes: {
                    exclude: ["id"]
                }
            })

            friends = friends.map(friend => {
                friend = friend.dataValues
                delete friend["login"]
                const subscribedTo = friend["subscribedTo"]
                friend["login"] = subscribedTo
                delete friend["subscribedTo"]
                return friend
            })

            return res.status(200).json(friends)
        } catch (_error) {
            console.log(_error)
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    addFriend = async (req, res) => {
        try {
            const friendLogin = req.body["login"]
            const token = req.header("Authorization").replace("Bearer ", "")
            const currentUserLogin = jwt.decode(token)["login"]
            if (friendLogin === currentUserLogin) {
                return res.status(200).json({
                    status: "ok"
                })
            }

            const findedUser = await this.#userModel.findOne({
                where: {
                    login: friendLogin
                }
            })
            if (!findedUser) {
                return res.status(404).json({
                    reason: `Cannot find user with login: ${friendLogin}`
                })
            }

            const findedFriend = await this.#friendModel.findOne({
                where: {
                    login: currentUserLogin,
                    subscribedTo: friendLogin
                }
            })
            if (findedFriend) {
                return res.status(200).json({
                    status: "ok"
                })
            }

            const newFriend = await this.#friendModel.create({
                login: currentUserLogin,
                subscribedTo: friendLogin,
                addedAt: new Date()
            })
            await newFriend.save()
            

            return res.status(200).json({
                status: "ok"
            })
        } catch (_error) {
            console.log(_error)
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    removeFriend = async (req, res) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "")
            const currentUserLogin = jwt.decode(token)["login"]
            const loginToUnsubscribe = req.body["login"]
            if (loginToUnsubscribe === currentUserLogin) {
                return res.status(200).json({
                    status: "ok"
                })
            }
    
            await this.#friendModel.destroy({
                where: {
                    login: currentUserLogin,
                    subscribedTo: loginToUnsubscribe
                }
            })

            return res.status(200).json({
                status: "ok"
            })

        } catch (_error) {
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    
}

module.exports = {UserController}