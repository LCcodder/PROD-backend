const generatePostId = () => {
    const digits = "1234567890"
    let id = ""
    for (let i = 0; i < 10; i++) {
        id += digits[
            Math.floor(Math.random() * (9 - 0 + 1) + 0)
        ]
    }
    return id
}

module.exports = {generatePostId}