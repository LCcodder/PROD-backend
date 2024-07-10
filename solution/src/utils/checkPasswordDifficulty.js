const isPasswordDifficult = (password) => {
    if (password.length > 100 || password.length < 6)
      return false

    const lowerCase = "qwertyuiopasdfghjklzxcvbnm"
    const upperCase = "QWERTYUIOPASDFGHJKLZXCVBNM"
    const digits = "1234567890"

    let isOneLcSymbol 
    let isOneUcSymbol
    let isOneDigit
    
    for (const letter of lowerCase) {
      if (password.includes(letter))
        isOneLcSymbol = true
    }

    for (const letter of upperCase) {
      if (password.includes(letter))
        isOneUcSymbol = true
    }

    for (const digit of digits) {
      if (password.includes(digit))
        isOneDigit = true
    }

    if ((isOneDigit + isOneLcSymbol + isOneUcSymbol) !== 3)
      return false

    return true
}

module.exports = {isPasswordDifficult}
