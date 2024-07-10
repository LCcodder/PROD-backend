const z = require("zod"),
    {isPasswordDifficult} = require("../../utils/checkPasswordDifficulty")

const InsertUserSchema = z.object({
    body: z.object({
        login: z.string().min(1).max(30).refine(str => str.match("[a-zA-Z0-9-]+")),
        email: z.string().min(1).max(50).refine(str => str.match()),
        countryCode: z.string().max(2).refine(str => str.match("[a-zA-Z]{2}")),
        password: z.string().min(6).max(100).refine(str => isPasswordDifficult(str)),
        isPublic: z.boolean(),
        phone: z.string().min(1).optional(),
        image: z.string().min(1).max(200).optional()
    }).strict()
})

const AuthUserSchema = z.object({
    body: z.object({
        login: z.string().min(1).max(30).refine(str => str.match("[a-zA-Z0-9-]+")),
        password: z.string().min(6).max(100).refine(str => isPasswordDifficult(str)),
    }).strict()
})

const GetUserSchema = z.object({
    params: z.object({
        login: z.string().min(1).max(30).refine(str => str.match("[a-zA-Z0-9-]+"))
    }).strict()
})

const UpdateProfileSchema = z.object({
    body: z.object({
        //login: z.string().min(1).max(30).refine(str => str.match("[a-zA-Z0-9-]+")).optional(),
        //email: z.string().min(1).max(50).refine(str => str.match()).optional(),
        countryCode: z.string().max(2).refine(str => str.match("[a-zA-Z]{2}")).optional(),
        //password: z.string().min(6).max(100).refine(str => isPasswordDifficult(str)).optional(),
        isPublic: z.boolean().optional(),
        phone: z.string().min(1).optional(),
        image: z.string().min(1).max(200).optional()
    }).strict()
})

const UpdatePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(6).max(100).refine(str => isPasswordDifficult(str)),
        newPassword: z.string().min(6).max(100).refine(str => isPasswordDifficult(str))
    }).strict()
})

const FriendAddOrDeleteSchema = z.object({
    body: z.object({
        login: z.string().min(1).max(30).refine(str => str.match("[a-zA-Z0-9-]+"))
    }).strict()
})

module.exports = {InsertUserSchema, AuthUserSchema, GetUserSchema, UpdateProfileSchema, UpdatePasswordSchema,  FriendAddOrDeleteSchema}