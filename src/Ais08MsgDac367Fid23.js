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

const MOD_NAME = 'Ais8MsgDac367Fid23';

const SUPPORTED_FIELDS = [
    'aisType',
    'channel',
    'repeatInd',
    'mmsi',
    'dac',
    'fid',
    'version',
    'utcDay',
    'utcHour',
    'utcMinute',
    'longitude',
    'latitude',
    'airPressure',
    'airTemperature',
    'avgWindSpeed',
    'avgGustSpeed',
    'avgWindDirection',
];

let suppValuesValid = false;
let suppValues: SuppValues = {};

/*
|==============================================================================
|Field |Len |Description |Member |T|Units
|0-5 | 6 |Message Type |type |u|Constant: 14
|6-7 | 2 |Repeat Indicator |repeat |u|Message repeat count
|8-37 | 30 |MMSI |mmsi |u|9 decimal digits
|38-39 | 2 |spare | |u|not used
|40-49 | 10 |Designated area code |dac |u|
|50-55 | 6 |Function identifier |fid |u|
|56-58 | 3 |Version |version |u| 0=test, 1-7=version
|59-63 | 5 |Day (UTC) |day |u|1-31; 0 = N/A (default)
|64-68 | 5 |Hour (UTC) |hour |u|0-23; 24 = N/A (default)
|69-74 | 6 |Minute (UTC) |minute |u|0-59; 60 = N/A (default)
|75-99 | 25 |Longitude |lon |I4| Long in 1/1000 min, +-180 deg as per 2's complement (e => +, w => -, 181 not available)
|100-123 | 24 |Latitude |lat |I4| Lat in 1/1000 min, +-90 deg as per 2's complement (n => +, s => -, 91 not available)
|124-132 | 9  |Air Pressure |air_pressure |u |0=799 hPa/less, 1–401=800–1200 hPa, 402=1201+/N/A=511
|133-143 | 11 |Air Temperature |air_temp |I4|Dry bulb temp, 0.1°C steps, -60.0 to +60.0°C (-1024=N/A, 601–1023 reserved)
|144-150 | 7  |Avg 10-min wind speed |avg_wind_speed |u|0-125 knots; 127 = N/A (default)
|151-157 | 7  |Avg 10-min gust speed|avg_gust_speed |u|0-125 knots; 127 = N/A (default)
|158-166 | 9  |Avg 10-min wind direction|avg_wind_dir |u|0-359 degree; 360 = N/A (default)
|167     | 1  |Spare | |u |Not used, set to zero
|==============================================================================
*/
export default class Ais8MsgDac367Fid23 extends AisMessage {
    constructor(aisType: number, bitField: AisBitField, channel: string) {
        super(aisType, bitField, channel);
        if (bitField.bits == 168) {
            this._valid = 'VALID';
        } else {
            this._valid = 'INVALID';
            this._errMsg = 'invalid bitcount for type 8 msg dac 1 fid 31:' + bitField.bits;
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



    // |56-58 | 3 |Version |version |u| 0=test, 1-7=version
    get version(): number {
        return this._bitField.getInt(56, 3, true);
    }

    // |59-63 | 5 |Day (UTC) |day |u|1-31; 0 = N/A (default)
    get day(): number {
        const v = this._bitField.getInt(59, 5, true);
        return v === 0 ? NaN : v;
    }

    // |64-68 | 5 |Hour (UTC) |hour |u|0-23; 24 = N/A (default)
    get hour(): number {
        const v = this._bitField.getInt(64, 5, true);
        return v >= 24 ? NaN : v;
    }

    // |69-74 | 6 |Minute (UTC) |minute |u|0-59; 60 = N/A (default)
    get minute(): number {
        const v = this._bitField.getInt(69, 6, true);
        return v >= 60 ? NaN : v;
    }

    // |75-99 | 25 |Longitude |lon |I4| Long in 1/1000 min, +-180 deg as per 2's complement (e => +, w => -, 181 not available)
    _getRawLon(): number {
        return this._bitField.getInt(75, 25, false) * 10;
    }

    // |100-123 | 24 |Latitude |lat |I4| Lat in 1/1000 min, +-90 deg as per 2's complement (n => +, s => -, 91 not available)
    _getRawLat(): number {
        return this._bitField.getInt(100, 24, false) * 10;
    }

    // |124-132 | 9  |Air Pressure |air_pressure |u |0=799 hPa/less, 1–401=800–1200 hPa, 402=1201+/N/A=511
    get airPressure(): number {
        const v = this._bitField.getInt(124, 9, true);
        if (v === 0) return 799;
        if (v === 402) return 1201;
        if (v >= 403) return NaN;
        return 800 + v;
    }

    // |133-143 | 11 |Air Temperature |air_temp |I4|Dry bulb temp, 0.1°C steps, -60.0 to +60.0°C (-1024=N/A, 601–1023 reserved)
    get airTemperature(): number {
        const v = this._bitField.getInt(133, 11, false);
        if (v === -1024) return NaN;
        return v / 10.0;
    }

    // |144-150 | 7  |Avg 10-min wind speed |avg_wind_speed |u|0-125 knots; 127 = N/A (default)
    get avgWindSpeed(): number {
        const v = this._bitField.getInt(144, 7, true);
        return v >= 127 ? NaN : v;
    }

    // |151-157 | 7  |Avg 10-min gust speed|avg_gust_speed |u|0-125 knots; 127 = N/A (default)
    get avgGustSpeed(): number {
        const v = this._bitField.getInt(151, 7, true);
        return v >= 127 ? NaN : v;
    }

    // |158-166 | 9  |Avg 10-min wind direction|avg_wind_dir |u|0-359 degree; 360 = N/A (default)
    get avgWindDirection(): number {
        const v = this._bitField.getInt(158, 9, true);
        return v >= 360 ? NaN : v;
    }

}