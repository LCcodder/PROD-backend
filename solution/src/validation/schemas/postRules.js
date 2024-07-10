const z = require("zod")

const InsertPostSchema = z.object({
    body: z.object({
        content: z.string().min(1).max(1000),
        tags: z.string().max(20).array(),
    })
})

module.exports = {InsertPostSchema}