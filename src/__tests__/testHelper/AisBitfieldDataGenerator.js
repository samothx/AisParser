import RandSeed from "random-seed"

const AIS_OUT_CHR_TBL: Array<string> = [
    '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
    ' ', '!', '\'', '#', '$', '%', '&', '"', '(', ')', '*', '+', ',', '-', '.', '/',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?']

const AIS_IN_CHR_TBL: Array<string> = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
    '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w']


let seed: number = 47110815
let rand: RandSeed = new RandSeed(seed)

export type TestData = {
    aisStr: string,
    padBits: number,
    bits: number,
    start: number,
    numBits: number
}

function  isValidString(str: string): string {
    let idx: number = 0
    for (; idx < str.length; idx++) {
        if (AIS_OUT_CHR_TBL.indexOf(str.charAt(idx)) < 0) {
            console.log()
            return 'invalid character ' + str.charAt(idx) + ' at index ' + idx
        }
    }

    return ''
}

function createTestData(): TestData {
    // enough bits to read a 32 bit integer or a 6 character string - 7 * 6 - 5 = 37 bits minimum
    let count = rand.intBetween(7, 100)
    let tmp : string = ''
    let idx: number = 0
    for (; idx < count; idx++) {
        // one of the legal characters
        tmp += AIS_IN_CHR_TBL[rand.intBetween(0, AIS_IN_CHR_TBL.length - 1)]
    }

    let padBits: number = rand.intBetween(0, 5)

    return {
        aisStr: tmp,
        padBits: padBits,
        bits: count * 6 - padBits,
        start: 0,
        numBits: 0
    }
}


function createStringTestData(): TestData {
    let result : TestData = createTestData()
    result.start = rand.intBetween(0, result.bits - 6)
    result.numBits = rand.intBetween(0, (result.bits - result.start) / 6) * 6
    return result
}

function createInvalidStringTestData(): TestData {
    let result : TestData = createTestData()

    let failIdx = rand.intBetween(0,result.aisStr.length - 1)
    result.numBits = rand.intBetween(1,result.aisStr.length - 1) * 6
    result.aisStr = result.aisStr.substr(0, failIdx) + 'X' + result.aisStr.substr(failIdx + 1)

    let stMin = failIdx * 6 - result.numBits - 1
    if(stMin < 0) {
        stMin = 0
    }

    let stMax = failIdx * 6 - 1

    result.start = rand.intBetween(stMin,stMax)
    if((result.start + result.numBits) >= result.bits) {
        result.start = result.bits - result.numBits
    }

    return result
}

function createIntTestData(): TestData {
    let result : TestData = createTestData()
    result.numBits = rand.intBetween(1, 32)
    result.start = rand.intBetween(0, result.bits - result.numBits)
    return result
}



module.exports = {
    isValidString: isValidString,
    createStringTestData: createStringTestData,
    createInvalidStringTestData: createInvalidStringTestData,
    createIntTestData: createIntTestData
}