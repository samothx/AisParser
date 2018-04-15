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