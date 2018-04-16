// @flow

import AisParser from '../AisParser'
import {getRealAisData} from './testHelper/AisBitfieldDataGenerator'
import type RealTestData from './testHelper/AisBitfieldDataGenerator'
import AisMessage from "../AisMessage"


let rad: ?RealTestData
test('testing real data ', () => {
    let parser = new AisParser({checksum: true})
    expect(parser).toBeDefined()
    let idx: number = 0
    while (rad = getRealAisData()) {
        let msg: AisMessage = parser.parse(rad.aisStr)
        expect(msg).toBeDefined()
        expect(msg.valid).toBe('VALID')
        expect(msg.aisType).toBe(rad.aisType)
    }
})
