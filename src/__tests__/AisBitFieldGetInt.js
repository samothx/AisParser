//@flow

import AisBitField from '../AisBitField'
import {isValidString,createInvalidStringTestData,createIntTestData} from './testHelper/AisBitfieldDataGenerator'


//const invalid : TestData = createInvalidStringTestData()
// const params : TestData = createStringTestData()
let curr : TestData = createIntTestData()

let idx : number = 0
for(;idx < 50;idx ++) {
    test('test AisBitfield.getInt with: {' + curr.aisStr + '} padBits:' + curr.padBits + ' bits:' + curr.bits + ' start:' + curr.start + ' numBits:' + curr.numBits, () => {
        expect(curr).toBeDefined()
        let bf: AisBitField = new AisBitField(curr.aisStr, curr.padBits)
        expect(bf).toBeDefined()
        if (bf) {
            let num: ?number = bf.getInt(curr.start, curr.numBits,true)
            expect(num).toBeDefined()
            expect(num >= 0).toBeTruthy()
        }
    })

    curr = createIntTestData()
}