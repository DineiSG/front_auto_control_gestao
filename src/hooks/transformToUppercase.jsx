/*Altera as palavras para letra maiuscula */

export const toUpperCaseData = (data) => {
    const upperCaseData = {};
    for (const key in data) {
        if (typeof data[key] === 'string') {
            upperCaseData[key] = data[key].toUpperCase()
        } else {
            upperCaseData[key] = data[key]
        }
    }
    return upperCaseData

}

