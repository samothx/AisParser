// @flow

/*
 * AisParser: A parser for NMEA0183 AIS messages.
 * Copyright (C) 2025 Davide Gessa <gessadavide@gmail.com>.
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

const MOD_NAME = 'Ais8MsgDac1Fid30';

const SUPPORTED_FIELDS = [
    'aisType',
    'channel',
    'repeatInd',
    'mmsi',
    'dac',
    'fid',
    'msgLinkageId',
    'text'
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
|40-49   | 10    |Designated area code     |dac       |u|
|50-55   | 6     |Function identifier      |fid       |u|
|56-65   | 10    |Message linkage id       |          |u|
|66-...  | <=155 |Free text                |text      |t|6 bit ascii


|==============================================================================
*/

export default class Ais8MsgDac1Fid30 extends AisMessage {
    constructor(aisType: number, bitField: AisBitField, channel: string) {
        super(aisType, bitField, channel);
        if (bitField.bits >= 104 && bitField.bits <= 1028) {
            this._valid = 'VALID';
        } else {
            this._valid = 'INVALID';
            this._errMsg = 'invalid bitcount for type 8 msg dac 1 fid 30:' + bitField.bits;
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


    // |40-49   | 10    |Designated area code     |dac       |u|
    get dac(): number {
        return this._bitField.getInt(40, 10, true);
    }

    // |50-55   | 6     |Function identifier      |fid       |u|
    get fid(): number {
        return this._bitField.getInt(50, 6, true);
    }

    // |56-65   | 10    |Message linkage id       |          |u|
    get msgLinkageId(): number {
        return this._bitField.getInt(56, 10, true);
    }

    // |66-...  | <=155 |Free text                |text      |t|6 bit ascii
    get text() : string {
        const textStart = 66;
        const maxTextBits = Math.min(this._bitField.bits - textStart, 155);
        const textLength = maxTextBits - (maxTextBits % 6);
        return this._formatStr(this._bitField.getString(textStart, textLength).replace(/^@+/, ''));
    }
}
