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
import type {SuppValues} from './AisMessage';
const MOD_NAME = 'AisCNBMsg';

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
  'rotStatus',
  'rot',
  'heading',
  'sogStatus',
  'sog',
  'cog',
  'latitude',
  'longitude',
  'posAccuracy',
  'utcTsSec',
  'utcTsStatus'
]

let suppValuesValid = false;
let suppValues : SuppValues = {};

/*
|==============================================================================
|Field   |Len |Description             |Member    |T|Units
|0-5     | 6  |Message Type            |type      |u|Constant: 1-3
|6-7     | 2  |Repeat Indicator        |repeat    |u|Message repeat count
|8-37    |30  |MMSI                    |mmsi      |u|9 decimal digits
|38-41   | 4  |Navigation Status       |status    |e|See "Navigation Status"
|42-49   | 8  |Rate of Turn (ROT)      |turn      |I3|See below
|50-59   |10  |Speed Over Ground (SOG) |speed     |U1|See below
|60-60   | 1  |Position Accuracy       |accuracy  |b|See below
|61-88   |28  |Longitude               |lon       |I4|Minutes/10000 (see below)
|89-115  |27  |Latitude                |lat       |I4|Minutes/10000 (see below)
|116-127 |12  |Course Over Ground (COG)|course    |U1|Relative to true north,
                                                     to 0.1 degree precision
|128-136 | 9  |True Heading (HDG)      |heading   |u|0 to 359 degrees,
                                                      511 = not available.
|137-142 | 6  |Time Stamp              |second    |u|Second of UTC timestamp
TODO:
|143-144 | 2  |Maneuver Indicator      |maneuver  |e|See "Maneuver Indicator"
|145-147 | 3  |Spare                   |          |x|Not used
|148-148 | 1  |RAIM flag               |raim      |b|See below
|149-167 |19  |Radio status            |radio     |u|See below
|==============================================================================

*/

export default class AisCNBMsg extends AisMessage {
  constructor(aisType : number,bitField : AisBitField, channel : string) {
    super(aisType,bitField,channel);
    if(bitField.bits >= 144) {
      this._valid = 'VALID';
    } else {
      this._valid = 'INVALID';
      this._errMsg = 'invalid bitcount for type CNB msg:' + bitField.bits;
    }
  }

  get class() : string {
    return 'A';
  }

  get supportedValues() : SuppValues {
    if(!suppValuesValid) {
      SUPPORTED_FIELDS.forEach((field)=>{
        let unit = AisMessage.getUnit(field);
        if(unit) {
          suppValues[field] = unit;
        } else {
          console.warn(MOD_NAME + 'field without unit encountered:' + field);
        }});
        suppValuesValid = true;
      }
    return suppValues;
  }

  get navStatus() : number {
    return this._bitField.getInt(38,4,true);
  }

  _getRawRot() : number {
    return this._bitField.getInt(42,8,false);
  }

  _getRawHeading() : number {
    return this._bitField.getInt(128, 9, true);
  }

  _getRawSog() : number {
    return this._bitField.getInt(50, 10, true);
  }

  _getRawCog() : number {
    return this._bitField.getInt(116, 12, true);
  }

  get posAccuracy() : boolean {
    return this._bitField.getInt(60, 1, true) === 1;
  }

  _getUtcSec() : number {
    return this._bitField.getInt(137,6,true);
  }

  _getRawLat() : number {
    return this._bitField.getInt(89,27,false);
  }

  _getRawLon() : number {
    return this._bitField.getInt(61,28,false);
  }

}
