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

const MOD_NAME = 'Ais8MsgDac200Fid10';

const SUPPORTED_FIELDS = [
    'aisType',
    'channel',
    'repeatInd',
    'mmsi',
    'dac',
    'fid',
    'vin',
    'length',
    'beam',
    'shipTypeERI',
    'hazard',
    'draught',
    'load',
    'speedQuality',
    'courseQuality',
    'headingQuality',
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
|56-103  | 48    |European Vessel ID       |vin       |t|8 six-bit characters
|104-116 | 13    |Length of ship           |length    |f|
|117-126 | 10    |Beam of ship             |beam      |f|
|127-140 | 14    |ERI classification       |shipTypeERI|u|
|141-143 | 3     |Hazardous cargo          |hazard    |u|
|144-154 | 11    |Draught                  |draught   |f|
|155-156 | 2     |Loaded/unloaded          |load      |u|
|157     | 1     |Quality of speed info    |speedQuality|b|
|158     | 1     |Quality of course info   |courseQuality|b|
|159     | 1     |Quality of heading info  |headingQuality|b|
|160-167 | 8     |spare                    |          |u|not used
|==============================================================================
*/

export default class Ais8MsgDac200Fid10 extends AisMessage {
    constructor(aisType: number, bitField: AisBitField, channel: string) {
        super(aisType, bitField, channel);
        if (bitField.bits == 168) {
            this._valid = 'VALID';
        } else {
            this._valid = 'INVALID';
            this._errMsg = 'invalid bitcount for type 8 msg dac 200 fid 10:' + bitField.bits;
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
    get dac() : number {
        return this._bitField.getInt(40,10,true);
    }

    // |50-55   | 6     |Function identifier      |fid       |u|
    get fid() : number {
        return this._bitField.getInt(50,6,true);
    }

    // |56-103  | 48    |European Vessel ID       |vin       |t|8 six-bit characters
    get vin() : string {
        return this._formatStr(this._bitField.getString(56, 48))
    }

    // |104-116 | 13    |Length of ship           |length    |f|
    get length(): number {
        return this._bitField.getInt(104, 13, true) / 10.
    }

    // |117-126 | 10    |Beam of ship             |beam      |f|
    get beam(): number {
        return this._bitField.getInt(117, 10, true) / 10.
    }

    // |127-140 | 14    |ERI classification       |shipTypeERI|u|
    get shipTypeERI(): number {
        return this._bitField.getInt(127, 14, true)
    }

    // |141-143 | 3     |Hazardous cargo          |hazard    |u|
    get hazard(): number {
        return this._bitField.getInt(141, 3, true)
    }

    // |144-154 | 11    |Draught                  |draught   |f|
    get draught(): number {
        return this._bitField.getInt(144, 11, true) / 100.
    }

    // |155-156 | 2     |Loaded/unloaded          |load      |u|
    get load(): number {
        return this._bitField.getInt(155, 2, true)
    }

    // |157     | 1     |Quality of speed info    |speedQuality|b|
    get speedQuality(): boolean {
        return this._bitField.getInt(157, 1, true) == 1
    }

    // |158     | 1     |Quality of course info   |courseQuality|b|
    get courseQuality(): boolean {
        return this._bitField.getInt(158, 1, true) == 1
    }

    // |159     | 1     |Quality of heading info  |headingQuality|b|
    get headingQuality(): boolean {
        return this._bitField.getInt(159, 1, true) == 1
    }
}
