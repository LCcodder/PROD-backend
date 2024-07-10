const {generatePostId} = require("../utils/postIdGenerator"),
    jwt = require("jsonwebtoken"),
    {normalizePost} = require("../utils/normalizePostObject")

class PostController {
    #postModel
    #userModel
    #friendModel
    #sequelize

    constructor(sequelize) {
        this.#sequelize = sequelize
        this.#postModel = sequelize.model('posts')
        this.#userModel = sequelize.model('users')
        this.#friendModel = sequelize.model('friends')
    }

    addNewPost = async (req, res) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "")
            const login = jwt.decode(token)["login"]

            const insertData = req.body

            const generatedId = generatePostId()

            let now = new Date();
            let nowRFC3339 = now.toISOString();

            const newPost = await this.#postModel.create(
                {
                    postId: generatedId,
                    author: login,
                    ...insertData,
                    createdAt: nowRFC3339,
                    likes: [],
                    dislikes: []
                }
            )
            await newPost.save()

            return res.status(200).json({
                id: generatedId,
                author: login,
                ...insertData,
                createdAt: nowRFC3339,
                likesCount: 0,
                dislikesCount: 0
            })
        } catch (_error) {
            console.log(_error)
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    getPost = async (req, res) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "")
            const currentUserLogin = jwt.decode(token)["login"]
            const postId = req.params["postId"]

            let findedPost = await this.#postModel.findOne({
                where: {
                    postId: postId
                },
                attributes: {
                    exclude: ["id"]
                }
            })
            if (!findedPost) {
                return res.status(404).json({
                    reason: "This post can't be found"
                })
            }
            findedPost = findedPost.dataValues
            const authorLogin = findedPost.author
            const findedAuthor = await this.#userModel.findOne({
                where: {
                    login: authorLogin
                }
            })
            if (!findedAuthor) {
                return res.status(404).json({
                    reason: "Cannot access to post author"
                })
            }
            if (!findedAuthor.dataValues.isPublic) {
                const findedFriend = await this.#friendModel.findOne({
                    where: {
                        login: authorLogin,
                        subscribedTo: currentUserLogin
                    }
                })
                if (!findedFriend) {
                    return res.status(404).json({
                        reason: "Cannot access to post author"
                    })
                }
                normalizePost(findedPost)
                return res.status(200).json(findedPost)
            }

            normalizePost(findedPost)
            return res.status(200).json(findedPost)

        } catch (_error) {
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    getMyFeed = async (req, res) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "")
            const login = jwt.decode(token)["login"]
            const limit = req.query["limit"]
            const offset = req.query["offset"]

            let posts = await this.#postModel.findAll({
                limit: limit,
                offset: offset,
                where: {
                    author: login
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                attributes: {
                    exclude: ["id"]
                }
            })
            posts.map(post => normalizePost(post.dataValues))
            
            return res.status(200).json(posts)
            
        } catch (_error) {
            console.log(_error)
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    getUserFeed = async (req, res) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "")
            const currentUserLogin = jwt.decode(token)["login"]
            const limit = req.query["limit"]
            const offset = req.query["offset"]
            const profileLogin = req.params["login"]

            if (profileLogin === currentUserLogin) {
                let posts = await this.#postModel.findAll({
                    limit: limit,
                    offset: offset,
                    where: {
                        author: profileLogin
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    attributes: {
                        exclude: ["id"]
                    }
                })
                posts.map(post => normalizePost(post.dataValues))
                return res.status(200).json(posts)
            }

            const findedUser = await this.#userModel.findOne({
                where: {
                    login: profileLogin
                }
            })
            
            if (!findedUser) {
                return res.status(404).json({
                    reason: "Can't access this feed"
                })
            }
            
            if (!findedUser.dataValues["isPublic"]) {
                const findedFriend = await this.#friendModel.findOne({
                    where: {
                        login: profileLogin,
                        subscribedTo: currentUserLogin
                    }
                })
                if (!findedFriend) {
                    return res.status(404).json({
                        reason: "Can't access this feed"
                    })
                }

                let posts = await this.#postModel.findAll({
                    limit: limit,
                    offset: offset,
                    where: {
                        author: profileLogin
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    attributes: {
                        exclude: ["id"]
                    }
                })
                posts.map(post => normalizePost(post.dataValues))
                return res.status(200).json(posts)
            }
            let posts = await this.#postModel.findAll({
                limit: limit,
                offset: offset,
                where: {
                    author: profileLogin
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                attributes: {
                    exclude: ["id"]
                }
            })
            posts.map(post => normalizePost(post.dataValues))
            return res.status(200).json(posts)
            
        } catch (_error) {
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    likePost = async (req, res) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "")
            const currentUserLogin = jwt.decode(token)["login"]
            const postId = req.params["postId"]

            let findedPost = await this.#postModel.findOne({
                where: {
                    postId: postId
                }
            })
            if (!findedPost) {
                return res.status(404).json({
                    reason: "This post can't be found"
                })
            }
            findedPost = findedPost.dataValues
            let findedAuthor = await this.#userModel.findOne({
                where: {
                    login: findedPost.author
                }
            })
            if (!findedAuthor) {
                return res.status(404).json({
                    reason: "Cannot access to post author"
                })
            }
            if (findedAuthor.login === currentUserLogin) {
                if (findedPost.likes.find(login => login === currentUserLogin)) {
                    normalizePost(findedPost)
                    return res.status(200).json(findedPost)
                }
                await this.#postModel.update(
                    {
                        likes: this.#sequelize.fn('array_append', this.#sequelize.col('likes'), currentUserLogin),
                        dislikes: this.#sequelize.fn('array_remove', this.#sequelize.col('dislikes'), currentUserLogin)
                    },
                    {
                        where: {
                            postId: postId
                        }
                    }
    
                )
                if (findedPost.dislikes.find(login => login === currentUserLogin)) {
                    normalizePost(findedPost)
                    findedPost["likesCount"] += 1
                    findedPost["dislikesCount"] -= 1
                } else {
                    normalizePost(findedPost)
                    findedPost["likesCount"] += 1
                }
                
                return res.status(200).json(findedPost)
            }
            if (!findedAuthor.isPublic) {
                const findedFriend = await this.#friendModel.findOne({
                    where: {
                        login: findedPost.author,
                        subscribedTo: currentUserLogin
                    }
                })
                if (!findedFriend) {
                    return res.status(404).json({
                        reason: "Cannot access to post author"
                    })
                }
                if (findedPost.likes.find(login => login === currentUserLogin)) {
                    normalizePost(findedPost)
                    return res.status(200).json(findedPost)
                }
                await this.#postModel.update(
                    {
                        likes: this.#sequelize.fn('array_append', this.#sequelize.col('likes'), currentUserLogin),
                        dislikes: this.#sequelize.fn('array_remove', this.#sequelize.col('dislikes'), currentUserLogin)
                    },
                    {
                        where: {
                            postId: postId
                        }
                    }
    
                )
                if (findedPost.dislikes.find(login => login === currentUserLogin)) {
                    normalizePost(findedPost)
                    findedPost["likesCount"] += 1
                    findedPost["dislikesCount"] -= 1
                } else {
                    normalizePost(findedPost)
                    findedPost["likesCount"] += 1
                }
                
                return res.status(200).json(findedPost)
                
            }
            if (findedPost.likes.find(login => login === currentUserLogin)) {
                normalizePost(findedPost)
                return res.status(200).json(findedPost)
            }
            await this.#postModel.update(
                {
                    likes: this.#sequelize.fn('array_append', this.#sequelize.col('likes'), currentUserLogin),
                    dislikes: this.#sequelize.fn('array_remove', this.#sequelize.col('dislikes'), currentUserLogin)
                },
                {
                    where: {
                        postId: postId
                    }
                }

            )
            if (findedPost.dislikes.find(login => login === currentUserLogin)) {
                normalizePost(findedPost)
                findedPost["likesCount"] += 1
                findedPost["dislikesCount"] -= 1
            } else {
                normalizePost(findedPost)
                findedPost["likesCount"] += 1
            }
            
            return res.status(200).json(findedPost)



        } catch (_error) {
            console.log(_error)
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }

    dislikePost = async (req, res) => {
        try {
            const token = req.header("Authorization").replace("Bearer ", "")
            const currentUserLogin = jwt.decode(token)["login"]
            const postId = req.params["postId"]

            let findedPost = await this.#postModel.findOne({
                where: {
                    postId: postId
                }
            })
            if (!findedPost) {
                return res.status(404).json({
                    reason: "This post can't be found"
                })
            }
            findedPost = findedPost.dataValues
            let findedAuthor = await this.#userModel.findOne({
                where: {
                    login: findedPost.author
                }
            })
            if (!findedAuthor) {
                return res.status(404).json({
                    reason: "Cannot access to post author"
                })
            }
            if (findedAuthor.login === currentUserLogin) {
                if (findedPost.dislikes.find(login => login === currentUserLogin)) {
                    normalizePost(findedPost)
                    return res.status(200).json(findedPost)
                }
                await this.#postModel.update(
                    {
                        likes: this.#sequelize.fn('array_remove', this.#sequelize.col('likes'), currentUserLogin),
                        dislikes: this.#sequelize.fn('array_append', this.#sequelize.col('dislikes'), currentUserLogin)
                    },
                    {
                        where: {
                            postId: postId
                        }
                    }
    
                )
                if (findedPost.likes.find(login => login === currentUserLogin)) {
                    normalizePost(findedPost)
                    findedPost["likesCount"] -= 1
                    findedPost["dislikesCount"] += 1
                } else {
                    normalizePost(findedPost)
                    findedPost["dislikesCount"] += 1
                }
                
                return res.status(200).json(findedPost)
            }
            if (!findedAuthor.isPublic) {
                const findedFriend = await this.#friendModel.findOne({
                    where: {
                        login: findedPost.author,
                        subscribedTo: currentUserLogin
                    }
                })
                if (!findedFriend) {
                    return res.status(404).json({
                        reason: "Cannot access to post author"
                    })
                }
                if (findedPost.dislikes.find(login => login === currentUserLogin)) {
                    normalizePost(findedPost)
                    return res.status(200).json(findedPost)
                }
                await this.#postModel.update(
                    {
                        likes: this.#sequelize.fn('array_remove', this.#sequelize.col('likes'), currentUserLogin),
                        dislikes: this.#sequelize.fn('array_append', this.#sequelize.col('dislikes'), currentUserLogin)
                    },
                    {
                        where: {
                            postId: postId
                        }
                    }
    
                )
                if (findedPost.likes.find(login => login === currentUserLogin)) {
                    normalizePost(findedPost)
                    findedPost["likesCount"] -= 1
                    findedPost["dislikesCount"] += 1
                } else {
                    normalizePost(findedPost)
                    findedPost["dislikesCount"] += 1
                }
                
                return res.status(200).json(findedPost)
                
            }
            if (findedPost.dislikes.find(login => login === currentUserLogin)) {
                normalizePost(findedPost)
                return res.status(200).json(findedPost)
            }
            await this.#postModel.update(
                {
                    likes: this.#sequelize.fn('array_remove', this.#sequelize.col('likes'), currentUserLogin),
                    dislikes: this.#sequelize.fn('array_append', this.#sequelize.col('dislikes'), currentUserLogin)
                },
                {
                    where: {
                        postId: postId
                    }
                }

            )
            if (findedPost.likes.find(login => login === currentUserLogin)) {
                normalizePost(findedPost)
                findedPost["likesCount"] -= 1
                findedPost["dislikesCount"] += 1
            } else {
                normalizePost(findedPost)
                findedPost["dislikesCount"] += 1
            }
            
            return res.status(200).json(findedPost)



        } catch (_error) {
            console.log(_error)
            return res.status(500).json({
                reason: "Unknown error was occured..."
            })
        }
    }
}

module.exports = {PostController}