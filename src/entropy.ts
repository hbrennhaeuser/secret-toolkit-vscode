const stringEntropy = require('fast-password-entropy');

export function getEntropy(
    input: string
){
    let entropy = stringEntropy(input);
    let rating = "";

    if (entropy <= 35) {
        rating = "Very weak";
    } else if (entropy >= 36 && entropy <= 59) {
        rating = "Weak";
    } else if (entropy >= 60 && entropy <= 119) {
        rating = "Strong";
    } else if (entropy >= 120) {
        rating = "Very strong";
    }

    return { entropy, rating };

}

