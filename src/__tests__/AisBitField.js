//@flow
import AisBitField from '../AisBitField'
// import fs from 'fs'
// import readline from 'readline'

const AIS_CHR_TBL : Array<string> = [
    '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
    ' ', '!', '\'', '#', '$', '%', '&', '"', '(', ')', '*', '+', ',', '-', '.', '/',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?' ];


// TODO: plan tests
// read arbitrary data - test if Bitfield fails
// read out of range data
// read data with expected values

type TestData = {
    aisStr : string,
    padBits : number,
    bits : number
}


function createCorrectRandomData() : TestData {
    // Char count between 5 and 100
    let count = 5 + Math.floor(Math.random() * 96)
    let padBits : number = Math.floor(Math.random() * 6)
    let result : TestData = {
        aisStr : '',
        // between 0 and 5 padbits
        padBits : padBits,
        bits : count * 6 - padBits
    }
    let idx : number = 0
    for(;idx < count;idx ++) {
        // one of the legal characters
        result.aisStr += AIS_CHR_TBL[Math.floor(Math.random() * AIS_CHR_TBL.length)]
    }
    return result
}

let idx : number = 0
for(;idx < 10;idx ++) {
    let testData: TestData = createCorrectRandomData()
    let bitField : ?AisBitField
    test('Create with random data:' + idx, () => {
        let bf = new AisBitField(testData.aisStr, testData.padBits)
        expect(bf).toBeDefined()
    })

    bitField = new AisBitField(testData.aisStr, testData.padBits)
    if(bitField) {
        console.log()
        let bf = bitField
        let idx1: number = 0
        let max: number = (Math.floor(testData.bits / 6) - 1) * 6
        for (; idx1 < max;idx1++) {
            let maxChars : number = Math.floor((testData.bits - idx1) / 6)
            let idx2: number = 0
            for (; idx2 > maxChars; idx2++) {
                let length :number = idx2 * 6
                test('bitfield(' + idx1 + ',' + length + ') of ' + testData.bits + ' bits',()=>{
                    let res = bf.getString(idx1,length)
                    expect(res.length).toBe(idx2)
                })
            }
        }
    }
}
