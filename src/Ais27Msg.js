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

const MOD_NAME = 'Ais27Msg';

const SUPPORTED_FIELDS = [
    'aisType',
    'channel',
    'repeatInd',
    'mmsi',
    'midCountry',
    'midCountryIso',
    'mmsiType',
    'class',
    'navStatus',
    'navStatusStr',
    'sogStatus',
    'sog',
    'cog',
    'latitude',
    'longitude',
    'posAccuracy',
];

let suppValuesValid = false;
let suppValues: SuppValues = {};

/*
|==============================================================================
|Field   |Len |Description             |Member    |T|Units
|0-5     | 6  |Message Type            |type      |u|Constant: 27
|6-7     | 2  |Repeat Indicator        |repeat    |u|Message repeat count
|8-37    |30  |MMSI                    |mmsi      |u|9 decimal digits
|38-38   | 1  |Position Accuracy       |accuracy  |u|
|39-39   | 1  |RAIM flag               |raim      |u|
|40-43   | 4  |Navigation Status       |status    |e|See "Navigation Status"
|44-61   |18  |Longitude               |lon       |I4|minutes/10 East positive, West negative 181000 = N/A
|62-78   |17  |Latitude                |lat       |I4|minutes/10 North positive, South negative 91000 = N/A
|79-84   |6   |Speed Over Ground (SOG) |speed     |u|Knots (0-62); 63 = N/A
|85-93   |9   |Course Over Ground (COG)|course    |u|0 to 359 degrees, 511 = not available.
|94-94   |1   |GNSS Position status    |gnss      |u|0 = current GNSS position 1 = not GNSS position (default)
|95-95   |1   |spare                   |          |u|not used
|==============================================================================

*/

export default class Ais27Msg extends AisMessage {
    constructor(aisType: number, bitField: AisBitField, channel: string) {
        super(aisType, bitField, channel);
        if (bitField.bits >= 94) {
            this._valid = 'VALID';
        } else {
            this._valid = 'INVALID';
            this._errMsg = 'invalid bitcount for type CNB msg:' + bitField.bits;
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

    get navStatus(): number {
        return this._bitField.getInt(40, 4, true);
    }

    _getRawSog(): number {
        return this._bitField.getInt(79, 6, true) * 10;
    }

    _getRawCog(): number {
        return this._bitField.getInt(85, 9, true) * 10;
    }

    get posAccuracy(): boolean {
        return this._bitField.getInt(38, 1, true);
    }

    _getRawLat(): number {
        return this._bitField.getInt(62, 17, false) * 1000;
    }

    _getRawLon(): number {
        return this._bitField.getInt(44, 18, false) * 1000;
    }

}
