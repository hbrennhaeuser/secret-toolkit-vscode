import * as crypto from 'crypto';


export function hexGenerator(
    bytes: number = 16
){
    return crypto.randomBytes(bytes).toString('hex');
}

export function passwordGenerator(
    length: number = 16,
    options: {
        lowercase?: number,
        uppercase?: number,
        numbers?: number,
        specialReduced?: number,
        specialAll?: number,
        custom?: number,
        customCharacters?: string,
        avoidAmbiguous?: boolean,
        encode?: string,
    } = { //defaults
        lowercase: 0,
        uppercase: 0,
        numbers: 0,
        specialReduced: 0,
        specialAll: 0,
        custom: 0,
        customCharacters: '',
        avoidAmbiguous: false,
        encode: '',
    }
): string {
    const ambiguousCharacters = 'il1Lo0O';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialReducedChars = '!@#$%^&*';
    const specialAllChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    
    let charset = '';
    let password = '';
    let requiredChars = '';

    const avoid_ambiguous = (chars: string): string => {
        if (options.avoidAmbiguous) {
            return chars.split('').filter(char => !ambiguousCharacters.includes(char)).join('');
        }
        return chars;
    };

    const getRandomChar = (chars: string) => chars[crypto.randomInt(0, chars.length)];


    // Assemble final characterset
    if (options.lowercase) {
        charset += lowercaseChars;
    }
    if (options.uppercase) {
        charset += uppercaseChars;
    }
    if (options.numbers) {
        charset += numberChars;
    }
    if (options.specialReduced) {
        charset += specialReducedChars;
    }
    if (options.specialAll) {
        charset += specialAllChars;
    }
    charset = avoid_ambiguous(charset); // Avoid ambiguous before adding customCharacters
    if (options.custom && options.customCharacters) {
        charset += options.customCharacters;
    } else if (options.custom && !options.customCharacters) {
        throw new Error('customSpecial is specified but customSpecialCharacters is empty');
    }

    if (!charset) {
        throw new Error('No character set selected');
    }


    // assemble requiredChars
    for (let i = 0; i < (options.lowercase ?? 0); i++) {
        requiredChars += getRandomChar(avoid_ambiguous(lowercaseChars));
    }
    for (let i = 0; i < (options.uppercase ?? 0); i++) {
        requiredChars += getRandomChar(avoid_ambiguous(uppercaseChars));
    }
    for (let i = 0; i < (options.numbers ?? 0); i++) {
        requiredChars += getRandomChar(avoid_ambiguous(numberChars));
    }
    for (let i = 0; i < (options.specialReduced ?? 0); i++) {
        requiredChars += getRandomChar(avoid_ambiguous(specialReducedChars));
    }
    for (let i = 0; i < (options.specialAll ?? 0); i++) {
        requiredChars += getRandomChar(avoid_ambiguous(specialAllChars));
    }
    for (let i = 0; i < (options.custom ?? 0); i++) {
        requiredChars += getRandomChar(options.customCharacters ?? ''); // ambiguous allowed here since user specified field
    }

    if (requiredChars.length > length) {
        throw new Error('Minimum requirements exceed the specified length');
    }

    if (!charset.length) {
        throw new Error('The characterset is empty, please check the preset settings');
    }

    // Add required characters
    for (let i = 0; i < requiredChars.length; i++) {
        password += requiredChars[i];
    }

    // Requireds are set, fill randomly until length is reached
    for (let i = requiredChars.length; i < length; i++) {
        password += getRandomChar(charset);
    }

    // Reorder the stirng randomly
    password = password.split('').sort(() => 0.5 - Math.random()).join('');


    // Encode options
    if (options.encode === 'base64') {
        return Buffer.from(password).toString('base64');
    
    // If not caught before (base64 is not a hashing algorithm, assume its one and pass it to crypto)
    } else if (options.encode) {
        try {
            return crypto.createHash(options.encode).update(password).digest('hex');
        } catch (error) {
            console.log("Supported hashes: " + crypto.getHashes());
            let msg=`Hashing method ${options.encode} is not supported, see log for supported hashes`;
            console.error(msg);
            throw new Error(msg);
            // vscode.window.showWarningMessage("Hashing method ${options.encode} is not supported, see log for supported hashes");

        }
    }

    return password;
}