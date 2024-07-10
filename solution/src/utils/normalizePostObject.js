const normalizePost = (post) => {
    post["likesCount"] = post["likes"].length
    post["dislikesCount"] = post["dislikes"].length
    post["id"] = post["postId"]
    delete post["postId"]
    delete post["likes"]
    delete post["dislikes"]
    return post
}

module.exports = {normalizePost}