const normalizeProfile = (profile) => {
    for (const key in profile) {
        if (profile[key] === undefined || profile[key] === null) {
            delete profile[key]
        }
        
    }
    return profile
}

module.exports = {normalizeProfile}