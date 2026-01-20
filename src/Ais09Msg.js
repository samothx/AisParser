// @flow

/*
 * AisParser: A parser for NMEA0183 AIS messages.
 * Copyright (C) 2026 Davide Gessa <gessadavide@gmail.com>.
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
import type {SuppValues} from './AisMessage';

const MOD_NAME = 'Ais09Msg';

/*
|==============================================================================
|Field   |Len |Description             |Member         |T|Units
|0-5     | 6  |Message Type            |type           |u|Constant: 9
|6-7     | 2  |Repeat Indicator        |repeat         |u|0-3
|8-37    |30  |MMSI                    |mmsi           |u|9 decimal digits
|38-49   |12  |Altitude (GNSS)         |altitude       |u|0-4094m, 4095=N/A
|50-59   |10  |Speed Over Ground       |speed          |u|0-1022 knots, 1023=N/A
|60-60   | 1  |Position Accuracy       |accuracy       |b|1=high (<=10m)
|61-88   |28  |Longitude               |lon            |I4|Minutes/10000
|89-115  |27  |Latitude                |lat            |I4|Minutes/10000
|116-127 |12  |Course Over Ground      |course         |U1|0.1 degrees
|128-133 | 6  |Time Stamp              |second         |u|UTC seconds
|134-134 | 1  |Altitude Sensor         |altitudeSensor |u|0=GNSS, 1=barometric
|135-141 | 7  |Spare                   |               |x|Not used
|142-142 | 1  |DTE                     |dte            |b|Data terminal ready
|143-145 | 3  |Spare                   |               |x|Not used
|146-146 | 1  |Assigned Mode Flag      |assigned       |b|0=autonomous, 1=assigned
|147-147 | 1  |RAIM Flag               |raim           |b|RAIM in use
|148-148 | 1  |Comm State Selector     |commStateSelector|u|0=SOTDMA, 1=ITDMA
|149-167 |19  |Communication State     |commState      |u|SOTDMA/ITDMA state
|==============================================================================
Total: 168 bits
*/

const SUPPORTED_FIELDS = [
  'aisType',
  'channel',
  'repeatInd',
  'mmsi',
  'midCountry',
  'midCountryIso',
  'mmsiType',
  'altitude',
  'altitudeStatus',
  'sogStatus',
  'sog',
  'posAccuracy',
  'longitude',
  'latitude',
  'cog',
  'utcTsSec',
  'utcTsStatus',
  'altitudeSensor',
  'dte',
  'assignedMode',
  'raim',
];

let suppValuesValid = false;
let suppValues : SuppValues = {};

export type AltitudeStatus = 'VALID' | 'HIGH' | 'NA';

export default class Ais09Msg extends AisMessage {
  constructor(aisType : number, bitField : AisBitField, channel : string) {
    super(aisType, bitField, channel);
    if(bitField.bits >= 168) {
      this._valid = 'VALID';
    } else {
      this._valid = 'INVALID';
      this._errMsg = 'invalid bitcount for type 9 msg:' + bitField.bits;
    }
  }

  get supportedValues() : SuppValues {
    if(!suppValuesValid) {
      SUPPORTED_FIELDS.forEach((field) => {
        let unit = AisMessage.getUnit(field);
        if(unit) {
          suppValues[field] = unit;
        } else {
          console.warn(MOD_NAME + ' field without unit encountered:' + field);
        }
      });
      suppValuesValid = true;
    }
    return suppValues;
  }

  get class() : string {
    return 'SAR';
  }

  // Altitude: 12 bits at position 38
  // 0-4094 = altitude in meters
  // 4095 = not available
  _getRawAltitude() : number {
    return this._bitField.getInt(38, 12, true);
  }

  get altitudeStatus() : AltitudeStatus {
    let alt = this._getRawAltitude();
    if (alt === 4095) return 'NA';
    if (alt === 4094) return 'HIGH';
    return 'VALID';
  }

  get altitude() : number {
    let alt = this._getRawAltitude();
    if (alt >= 4094) return NaN;
    return alt;
  }

  // SOG: 10 bits at position 50
  // 0-1022 = speed in knots (no decimal)
  // 1023 = not available
  _getRawSog() : number {
    return this._bitField.getInt(50, 10, true);
  }

  get sog() : number {
    let sog = this._getRawSog();
    if (sog >= 1023) return NaN;
    return sog;
  }

  // Position Accuracy: 1 bit at position 60
  get posAccuracy() : boolean {
    return this._bitField.getInt(60, 1, true) === 1;
  }

  // Longitude: 28 bits at position 61
  _getRawLon() : number {
    return this._bitField.getInt(61, 28, false);
  }

  // Latitude: 27 bits at position 89
  _getRawLat() : number {
    return this._bitField.getInt(89, 27, false);
  }

  // COG: 12 bits at position 116
  // 0-3599 = 0.0-359.9 degrees
  // 3600 = not available
  _getRawCog() : number {
    return this._bitField.getInt(116, 12, true);
  }

  // UTC Timestamp: 6 bits at position 128
  _getUtcSec() : number {
    return this._bitField.getInt(128, 6, true);
  }

  // Altitude Sensor: 1 bit at position 134
  // 0 = GNSS, 1 = barometric
  get altitudeSensor() : number {
    return this._bitField.getInt(134, 1, true);
  }

  // DTE: 1 bit at position 142
  // 0 = data terminal available, 1 = not available
  get dte() : boolean {
    return this._bitField.getInt(142, 1, true) === 0;
  }

  // Assigned Mode Flag: 1 bit at position 146
  // 0 = autonomous/continuous mode, 1 = assigned mode
  get assignedMode() : boolean {
    return this._bitField.getInt(146, 1, true) === 1;
  }

  // RAIM Flag: 1 bit at position 147
  get raim() : boolean {
    return this._bitField.getInt(147, 1, true) === 1;
  }

  // Communication State Selector: 1 bit at position 148
  // 0 = SOTDMA, 1 = ITDMA
  get commStateSelector() : number {
    return this._bitField.getInt(148, 1, true);
  }

  // Communication State: 19 bits at position 149
  get commState() : number {
    return this._bitField.getInt(149, 19, true);
  }
}
