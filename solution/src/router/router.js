const { PingController } = require("../controllers/pingController"),
    {CountryController} = require("../controllers/countryController"),
    {UserController} = require("../controllers/userController"),
    {PostController} = require("../controllers/postController"),
    {validate} = require("../validation/validationMiddleware"),
    {authMiddlewareFactory} = require("../auth/authMiddlewareFactory"),
    {tokenGeneratorFactory} = require("../auth/tokenGeneratorFactory"),
    {tokenRemoverFactory} = require("../auth/tokenRemoverFactory"),
    {
        InsertUserSchema, 
        AuthUserSchema, 
        GetUserSchema, 
        UpdateProfileSchema, 
        UpdatePasswordSchema,
        FriendAddOrDeleteSchema
    } = require("../validation/schemas/userRules"),
    {InsertPostSchema} = require("../validation/schemas/postRules")


const initRoutes = (app, sequelize, secret) => {
    const authMiddleware = authMiddlewareFactory(secret, sequelize.model('tokens'))
    const tokenGenerator = tokenGeneratorFactory(secret, sequelize.model('tokens'))
    const tokenRemover = tokenRemoverFactory(sequelize.model('tokens'))

    const pingController = new PingController()
    app.get("/api/ping", pingController.ping)


    const countryController = new CountryController(sequelize)
    app.get("/api/countries", countryController.getAllCountries)
    app.get("/api/countries/:alpha2", countryController.getCountryByAlpha2)


    const userController = new UserController(
        sequelize,
        tokenGenerator,
        tokenRemover
    )
    app.post("/api/auth/register", validate(InsertUserSchema), userController.addNewUser)
    app.post("/api/auth/sign-in", validate(AuthUserSchema), userController.authUserAndGetToken)
    
    app.get("/api/me/profile", authMiddleware, userController.getProfileByDecodedToken)
    app.patch("/api/me/profile", authMiddleware, validate(UpdateProfileSchema), userController.editProfileByDecodedToken)
    app.post("/api/me/updatePassword", authMiddleware, validate(UpdatePasswordSchema), userController.updatePasswordByDecodedToken)
    
    app.get("/api/profiles/:login", authMiddleware, validate(GetUserSchema), userController.getUserProfile)

    app.post("/api/friends/add", authMiddleware, validate(FriendAddOrDeleteSchema), userController.addFriend)
    app.post("/api/friends/remove", authMiddleware, validate(FriendAddOrDeleteSchema), userController.removeFriend)
    app.get("/api/friends", authMiddleware, userController.getFriends)


    const postController = new PostController(sequelize)
    app.post("/api/posts/new", authMiddleware, validate(InsertPostSchema), postController.addNewPost)
    app.get("/api/posts/:postId", authMiddleware, postController.getPost)
    app.get("/api/posts/feed/my", authMiddleware, postController.getMyFeed)
    app.get("/api/posts/feed/:login", authMiddleware, postController.getUserFeed)

    app.post("/api/posts/:postId/like", authMiddleware, postController.likePost)
    app.post("/api/posts/:postId/dislike", authMiddleware, postController.dislikePost)
}

module.exports = {initRoutes} 