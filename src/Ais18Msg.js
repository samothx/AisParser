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

const MOD_NAME = 'Ais18Msg';


/*
|==============================================================================
|Field   |Len |Description        |Member   |T|Units
|0-5     | 6  |Message Type       |type     |u|Constant: 18
|6-7     | 2  |Repeat Indicator   |repeat   |u|As in Common Navigation Block
|8-37    |30  |MMSI               |mmsi     |u|9 decimal digits
|38-45   | 8  |Regional Reserved  |reserved |x|Not used
|46-55   |10  |Speed Over Ground  |speed    |u|As in common navigation block
|56-56   | 1  |Position Accuracy  |accuracy |b|See below
|57-84   |28  |Longitude          |lon      |I4|Minutes/10000 (as in CNB)
|85-111  |27  |Latitude           |lat      |I4|Minutes/10000 (as in CNB)
|112-123 |12  |Course Over Ground |course   |U1|0.1 degrees from true north
|124-132 | 9  |True Heading       |heading  |u|0 to 359 degrees, 511 = N/A
|133-138 | 6  |Time Stamp         |second   |u|Second of UTC timestamp.
TODO:
|139-140 | 2  |Regional reserved  |regional |u|Uninterpreted
|141-141 | 1  |CS Unit            |cs       |b|0=Class B SOTDMA unit
                                               1=Class B CS (Carrier Sense) unit
|142-142 | 1  |Display flag       |display  |b|0=No visual display,
                                               1=Has display,
                                               (Probably not reliable).
|143-143 | 1  |DSC Flag           |dsc      |b|If 1, unit is attached to a VHF
                                               voice radio with DSC capability.
|144-144 | 1  |Band flag          |band     |b|Base stations can command units
                                               to switch frequency. If this flag
                                               is 1, the unit can use any part
                                               of the marine channel.
|145-145 | 1  |Message 22 flag    |msg22    |b|If 1, unit can accept a channel
                                               assignment via Message Type 22.
|146-146 | 1  |Assigned           |assigned |b|Assigned-mode flag:
                                               0 = autonomous mode (default),
                                               1 = assigned mode.
|147-147 | 1  |RAIM flag          |raim     |b|As for common navigation block
|148-167 |20  |Radio status       |radio    |u|See <<IALA>> for details.
|==============================================================================
*/

const SUPPORTED_FIELDS = [
  'aisType',
  'channel',
  'repeatInd',
  'mmsi',
  'midCountry',
  'midCountryIso',  
  'mmsiType',
  'heading',
  'sogStatus',
  'sog',
  'cog',
  'latitude',
  'longitude',
  'posAccuracy',
  'utcTsSec',
  'utcTsStatus',
 ];
 let suppValuesValid = false;
 let suppValues : SuppValues = {};


export default class Ais18Msg extends AisMessage {
  constructor(aisType : number,bitField : AisBitField, channel : string) {
    super(aisType,bitField,channel);
    if(bitField.bits >= 167) {
      this._valid = 'VALID';
    } else {
      this._valid = 'INVALID';
      this._errMsg = 'invalid bitcount for type 18 msg:' + bitField.bits;
    }
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

  get class() : string {
    return 'B';
  }

  _getRawHeading() : number {
    return this._bitField.getInt(124, 9, true);
  }

  _getRawSog() : number {
    return this._bitField.getInt(46, 10, true);
  }

  _getRawCog() : number {
    return this._bitField.getInt(112, 12, true);
  }

  get posAccuracy() : boolean {
    return this._bitField.getInt(56, 1, true) === 1;
  }

  _getUtcSec() : number {
    return this._bitField.getInt(133,6,true);
  }

  _getRawLat() : number {
    return this._bitField.getInt(85,27,false);
  }

  _getRawLon() : number {
    return this._bitField.getInt(57,28,false);
  }
}
