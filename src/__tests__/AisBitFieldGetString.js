//@flow
import AisBitField from '../AisBitField'
import {isValidString,createInvalidStringTestData,createStringTestData} from './testHelper/AisBitfieldDataGenerator'


const invalid : TestData = createInvalidStringTestData()
const params : TestData = createStringTestData()
let curr : TestData = createStringTestData()

let idx : number = 0
for(;idx < 50;idx ++) {
    test('test AisBitfield.getString with: {' + curr.aisStr + '} padBits:' + curr.padBits + ' bits:' + curr.bits + ' start:' + curr.start + ' numBits:' + curr.numBits, () => {
        expect(curr).toBeDefined()
        let bf: AisBitField = new AisBitField(curr.aisStr, curr.padBits)
        expect(bf).toBeDefined()
        if (bf) {
            let str: ?string = bf.getString(curr.start, curr.numBits)
            expect(str).toBeDefined()
            expect(isValidString(str)).toBe('')
            expect(str.length).toBe(curr.numBits / 6)
        }
    })

    curr = createStringTestData()
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


test('Test with invalid chars on {' + invalid.aisStr + '} padBits:' + invalid.padBits + ' bits:' + invalid.bits + ' start: ' + invalid.start + ' numBits: ' + invalid.numBits,()=>{
    expect(invalid).toBeDefined()
    let bf: AisBitField = new AisBitField(invalid.aisStr, invalid.padBits)
    expect(bf).toBeDefined()
    function invalid0() {
            bf.getString(invalid.start,invalid.numBits)
    }
    expect(invalid0).toThrow(/invalid character encountered/)
})