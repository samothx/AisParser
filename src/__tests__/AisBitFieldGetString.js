//@flow
import AisBitField from '../AisBitField'
import RandSeed from 'random-seed'

// import fs from 'fs'
// import readline from 'readline'

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

type TestData = {
    aisStr: string,
    padBits: number,
    bits: number,
    start: number,
    numBits: number
}



function validString(str : string) : string {
    let idx : number = 0
    for(;idx < str.length;idx ++) {
        if(AIS_OUT_CHR_TBL.indexOf(str.charAt(idx)) < 0) {
            console.log()
            return 'invalid character ' + str.charAt(idx) + ' at index ' + idx
        }
    }

    return ''
}

let rand = null


function createRandomTestData(): TestData {
    // Char count between 5 and 40
    if(!rand) {
        rand = new RandSeed(47110815)
    }
    let count = 5 + rand.intBetween(5,100)
    let padBits: number = rand.intBetween(0,5)
    let result: TestData = {
        aisStr: '',
        // between 0 and 5 padbits
        padBits: padBits,
        bits: count * 6 - padBits,
        start : 0,
        numBits : 0
    }

    let idx: number = 0
    for (; idx < count; idx++) {
        // one of the legal characters
        result.aisStr += AIS_IN_CHR_TBL[rand.intBetween(0,AIS_IN_CHR_TBL.length - 1)]
    }

    result.start = rand.intBetween(0,result.bits - 6)
    result.numBits = rand.intBetween(0,(result.bits - result.start) / 6) * 6
    return result
}

function createInvalidTestData(): TestData {
    let tmp = createRandomTestData()
    tmp.aisStr = tmp.aisStr.substr(0,2) + 'X' + tmp.aisStr.substr(3)
    return tmp
}

/*beforeEach(()=>{
    curr = createRandomTestData()
})
*/

const invalid : TestData = createInvalidTestData()
const params : TestData = createRandomTestData()
let curr : TestData = createRandomTestData()

let idx : number = 0
for(;idx < 50;idx ++) {
    test('test AisBitfield.getString with: {' + curr.aisStr + '} padBits:' + curr.padBits + ' bits:' + curr.bits + ' start:' + curr.start + ' numBits:' + curr.numBits, () => {
        expect(curr).toBeDefined()
        let bf: AisBitField = new AisBitField(curr.aisStr, curr.padBits)
        expect(bf).toBeDefined()
        if (bf) {
            let str: ?string = bf.getString(curr.start, curr.numBits)
            expect(str).toBeDefined()
            expect(validString(str)).toBe('')
            expect(str.length).toBe(curr.numBits / 6)
        }
    })

    curr = createRandomTestData()
}

test('Test with invalid params on {' + params.aisStr + '} padBits:' + params.padBits + ' bits:' + params.bits + ' start: -1 numBits: 12',()=> {
    let bf: AisBitField = new AisBitField(params.aisStr, params.padBits)

    expect(bf).toBeDefined()

    function invalid0() {
        bf.getString(-1, 12)
    }

    expect(invalid0).toThrow(/invalid indexes encountered/);
})

test('Test with invalid params on {' + params.aisStr + '} padBits:' + params.padBits + ' bits:' + params.bits + ' start: 0 numBits: ' +  ((Math.floor(params.bits / 6) + 1) * 6),()=> {
    let bf: AisBitField = new AisBitField(params.aisStr, params.padBits)

    expect(bf).toBeDefined()

    function invalid0() {
        bf.getString(0, (Math.floor(params.bits / 6) + 1) * 6)
    }

    expect(invalid0).toThrow(/invalid indexes encountered/);
})


test('Test with invalid params on {' + params.aisStr + '} padBits:' + params.padBits + ' bits:' + params.bits + ' start: 7 numBits: ' +  (Math.floor(params.bits / 6) * 6),()=> {
    let bf: AisBitField = new AisBitField(params.aisStr, params.padBits)

    expect(bf).toBeDefined()

    function invalid0() {
        bf.getString(7, Math.floor(params.bits / 6) * 6)
    }

    expect(invalid0).toThrow(/invalid indexes encountered/);
})

test('Test with invalid params on {' + params.aisStr + '} padBits:' + params.padBits + ' bits:' + params.bits + ' start: 4 numBits: 11',()=> {
    let bf: AisBitField = new AisBitField(params.aisStr, params.padBits)

    expect(bf).toBeDefined()

    function invalid0() {
        bf.getString(4,11)
    }

    expect(invalid0).toThrow(/invalid indexes encountered/);
})


test('Test with invalid chars on {' + invalid.aisStr + '} padBits:' + invalid.padBits + ' bits:' + invalid.bits + ' start: 5 numBits: 24',()=>{
    expect(invalid).toBeDefined()
    let bf: AisBitField = new AisBitField(invalid.aisStr, invalid.padBits)
    expect(bf).toBeDefined()
    function invalid0() {
            bf.getString(5, 24)
    }
    expect(invalid0).toThrow(/invalid character encountered/)
})