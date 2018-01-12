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

const MOD_NAME = 'Ais21Msg';
/*
|==============================================================================
|Field    |Len |Description            |Member       |T|Units
|0-5      |  6 |Message Type           |type         |u|Constant: 19
|6-7      |  2 |Repeat Indicator       |repeat       |u|As in CNN
|8-37     | 30 |MMSI                   |mmsi         |u|9 digits
|38-45    |  8 |Regional Reserved      |reserved     |u|
|46-55    | 10 |Speed Over Ground      |speed        |u|As in CNB.
|56-56    |  1 |Position Accuracy      |accuracy     |b|As in CNB.
|57-84    | 28 |Longitude              |lon          |I4|Minutes/10000 (as in CNB)
|85-111   | 27 |Latitude               |lat          |I4|Minutes/10000 (as in CNB)
|112-123  | 12 |Course Over Ground     |course       |U1|Relative to true north,
                                                        units of 0.1 degrees
|124-132  |  9 |True Heading           |heading      |u|0 to 359 degrees,
                                                        511 = N/A
|133-138  |  6 |Time Stamp             |second       |u|Second of UTC timestamp.
|139-142  |  4 |Regional reserved      |regional     |u|Uninterpreted
|143-262  |120 |Name                   |shipname     |s|20 6-bit characters
|263-270  |  8 |Type of ship and cargo |shiptype     |u|As in Message 5
|271-279  |  9 |Dimension to Bow       |to_bow       |u|Meters
|280-288  |  9 |Dimension to Stern     |to_stern     |u|Meters
|289-294  |  6 |Dimension to Port      |to_port      |u|Meters
|295-300  |  6 |Dimension to Starboard |to_starboard |u|Meters
|301-304  |  4 |Position Fix Type      |epfd         |e|See "EPFD Fix Types"
|305-305  |  1 |RAIM flag              |raim         |b|As in CNB.
|306-306  |  1 |DTE                    |dte          |b|0=Data terminal ready,
                                                       1=Not ready (default).
|307-307  |  1 |Assigned mode flag     |assigned     |u|See <<IALA>> for details
|308-311  |  4 |Spare                  |             |x|Unused, should be zero
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
  'class',
  'heading',
  'sogStatus',
  'sog',
  'cog',
  'latitude',
  'longitude',
  'posAccuracy',
  'utcTsSec',
  'utcTsStatus',
  'name',
  'shipType',
  'shipTypeStr',
  'dimToBow',
  'dimToBowStatus',
  'dimToStern',
  'dimToSternStatus',
  'dimToPort',
  'dimToPortStatus',
  'dimToStbrd',
  'dimToStbrdStatus',
  'epfd',
  'epfdStr'
 ];

 let suppValuesValid = false;
 let suppValues : SuppValues = {};


export default class Ais19Msg extends AisMessage {
  constructor(aisType : number,bitField : AisBitField, channel : string) {
    super(aisType,bitField,channel);
    if(bitField.bits >= 311) {
      this._valid = 'VALID';
    } else {
      this._valid = 'INVALID';
      this._errMsg = 'invalid bitcount for type 19 msg:' + bitField.bits;
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

  // |124-132  |  9 |True Heading           |heading      |u|0 to 359 degrees,
  _getRawHeading() : number {
    return this._bitField.getInt(124, 9, true);
  }

  //|46-55    | 10 |Speed Over Ground      |speed        |u|As in CNB.
  _getRawSog() : number {
    return this._bitField.getInt(46, 10, true);
  }

  // |112-123  | 12 |Course Over Ground     |course       |U1|Relative to true north,
  _getRawCog() : number {
    return this._bitField.getInt(112, 12, true);
  }

  // |56-56    |  1 |Position Accuracy      |accuracy     |b|As in CNB.
  get posAccuracy() : boolean {
    return this._bitField.getInt(56, 1, true) === 1;
  }

  // |133-138  |  6 |Time Stamp             |second       |u|Second of UTC timestamp.
  _getUtcSec() : number {
    return this._bitField.getInt(133,6,true);
  }

  // |85-111   | 27 |Latitude               |lat          |I4|Minutes/10000 (as in CNB)
  _getRawLat() : number {
    return this._bitField.getInt(85,27,false);
  }

  // |57-84    | 28 |Longitude              |lon          |I4|Minutes/10000 (as in CNB)
  _getRawLon() : number {
    return this._bitField.getInt(57,28,false);
  }

  // |143-262  |120 |Name                   |shipname     |s|20 6-bit characters
  get name() : string {
    return this._formatStr(this._bitField.getString(143,120));
  }

  // |263-270  |  8 |Type of ship and cargo |shiptype     |u|As in Message 5
  get shipType() : number {
    return this._bitField.getInt(263,8,true);
  }

  // |271-279  |  9 |Dimension to Bow       |to_bow       |u|Meters
  _getDimToBow() : number {
    return this._bitField.getInt(271,9,true);
  }

  // |280-288  |  9 |Dimension to Stern     |to_stern     |u|Meters
  _getDimToStern() : number {
    return this._bitField.getInt(280,9,true);
  }

  // |289-294  |  6 |Dimension to Port      |to_port      |u|Meters
  _getDimToPort() : number {
    return this._bitField.getInt(289,6,true);
  }

  // |295-300  |  6 |Dimension to Starboard |to_starboard |u|Meters
  _getDimToStbrd() : number {
    return this._bitField.getInt(295,6,true);
  }

  // |301-304  |  4 |Position Fix Type      |epfd         |e|See "EPFD Fix Types"
  get epfd() : number {
    return this._bitField.getInt(301,4,true);
  }
}
