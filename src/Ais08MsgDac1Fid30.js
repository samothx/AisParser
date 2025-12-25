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
    'sequence',
    'destinationMMSI',
    'retransmitted',
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
|38-39   | 2     |Seq number               |seq       |u|0 - 3; refer to § 5.3.1, Annex 2 of ITU-R M.1371-3.
|40-69   | 30    |Destination              |dest      |u|9 decimal digits
|70      | 1     |Retransmitted flag       |retransm  |b|0=no retransm / default, 1=retansmitted
|71      | 1     |spare                    |          
|72-81   | 10    |Designated area code     |dac       |u|
|81-86   | 6     |Function identifier      |fid       |u|
|87-96   | 10    |Message linkage id       |          |u|
|97-...  | <=161 |Free text                |text      |t|6 bit ascii
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


    // |38-39   | 2     |Seq number               |seq       |u|
    get sequence(): number {
        return this._bitField.getInt(38, 2, true);
    }

    // |40-69   | 30    |Destination              |dest      |u|
    get destinationMMSI(): number {
        return this._bitField.getInt(40, 30, true);
    }

    // |70      | 1     |Retransmitted flag          |retransm  |b|
    get retransmitted(): boolean {
        return this._bitField.getInt(70, 1, true) === 1;
    }

    // |71      | 1     |spare                    |
    get spare(): number {
        return this._bitField.getInt(71, 1, true);
    }

    // |72-81   | 10    |Designated area code     |dac       |u|
    get dac(): number {
        return this._bitField.getInt(72, 10, true);
    }

    // |82-87   | 6     |Function identifier      |fid       |u|
    get fid(): number {
        return this._bitField.getInt(82, 6, true);
    }

    // |88-97   | 10    |Message linkage id       |          |u|
    get msgLinkageId(): number {
        return this._bitField.getInt(88, 10, true);
    }

    // |98-...  | <=161 |Free text                |text      |t|6 bit ascii
    get text(): string {
        const textStart = 98;
        const maxTextBits = Math.min(this._bitField.bits - textStart, 161);
        const textLength = maxTextBits - (maxTextBits % 6);
        if (textLength <= 0) {
            return '';
        }
        const raw = this._bitField.getString(textStart, textLength);
        // strip leading @ padding and apply existing formatting helper
        return this._formatStr(raw.replace(/^@+/, ''));
    }
}
