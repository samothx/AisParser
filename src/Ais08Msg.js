// @flow

/*
 * AisParser: A parser for NMEA0183 AIS messages.
 * Copyright (C) 2017 Thomas Runte <coding@etnur.net>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Apache License Version 2.0 as published by
 * Apache Software foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the Apache License Version 2.0
 * along with this program.  If not, see <https://www.apache.org/licenses/LICENSE-2.0/>.
 */

import AisBitField from './AisBitField';
import AisMessage from './AisMessage';
import type { SuppValues } from './AisMessage';

const MOD_NAME = 'Ais8Msg';

const SUPPORTED_FIELDS = [
    'aisType',
    'channel',
    'repeatInd',
    'mmsi',
    'dac',
    'fid',
    'data'
];

let suppValuesValid = false;
let suppValues: SuppValues = {};

/*
|==============================================================================
|Field   |Len    |Description              |Member    |T|Units
|0-5     | 6     |Message Type             |type      |u|Constant: 14
|6-7     | 2     |Repeat Indicator         |repeat    |u|Message repeat count
|8-37    | 30    |MMSI                     |mmsi      |u|9 decimal digits
|38-39   | 2     |spare                    |          |u|not used
|40-50   | 10    |Designated area code     |dac       |u|
|50-56   | 6     |Function identifier      |fid       |u|
|57-...  | <=952 |Application specific data|data      |u|binary data
|==============================================================================
*/

export default class Ais8Msg extends AisMessage {
    constructor(aisType: number, bitField: AisBitField, channel: string) {
        super(aisType, bitField, channel);
        if (bitField.bits >= 56 && bitField.bits <= 1008) {
            this._valid = 'VALID';
        } else {
            this._valid = 'INVALID';
            this._errMsg = 'invalid bitcount for type 8 msg:' + bitField.bits;
        }
    }

    get class(): string {
        return 'A';
    }

    get supportedValues(): SuppValues {
        if (!suppValuesValid) {
            SUPPORTED_FIELDS.forEach((field) => {
                let unit = AisMessage.getUnit(field);
                if (unit) {
                    suppValues[field] = unit;
                } else {
                    console.warn(MOD_NAME + 'field without unit encountered:' + field);
                }
            });
            suppValuesValid = true;
        }
        return suppValues;
    }


    // |40-50   | 10    |Designated area code     |dac       |u|
    get dac() : number {
        return this._bitField.getInt(40,10,true);
    }

    // |50-56   | 6     |Function identifier      |fid       |u|
    get fid() : number {
        return this._bitField.getInt(50,6,true);
    }

    // |57-...  | <=952 |Name                   |text     |s|max of 952 binary data
    get data() : Uint8Array {
        const dataStart = 57;
        const maxDataBits = Math.min(this._bitField.bits - dataStart, 952);
        return this._bitField.getBytes(dataStart, maxDataBits);
    }
}
