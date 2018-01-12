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
|Field    |Len |Description            |Member      |T|Units
|0-5      | 6  |Message Type           |type        |u|Constant: 21
|6-7      | 2  |Repeat Indicator       |repeat      |u|As in CNB
|8-37     |30  |MMSI                   |mmsi        |u|9 digits
|38-42    | 5  |Aid type               |aid_type    |e|See "Navaid Types"
|43-162  1|120 |Name                   |name        |t|Name in sixbit chars
|163-163  | 1  |Position Accuracy      |accuracy    |b|As in CNB
|164-191  |28  |Longitude              |lon         |I4|Minutes/10000 (as in CNB)
|192-218  |27  |Latitude               |lat         |I4|Minutes/10000 (as in CNB)
|219-227  | 9  |Dimension to Bow       |to_bow      |u|Meters
|228-236  | 9  |Dimension to Stern     |to_stern    |u|Meters
|237-242  | 6  |Dimension to Port      |to_port     |u|Meters
|243-248  | 6  |Dimension to Starboard |to_starboard|u|Meters
|249-252  | 4  |Type of EPFD           |epfd        |e|As in Message Type 4
|253-258  | 6  |UTC Second             |second      |u|As in Message Type 5
|259-259  | 1  |Off-Position Indicator |off_position|b|See Below
|260-267  | 8  |Regional reserved      |regional    |u|Uninterpreted
|268-268  | 1  |RAIM flag              |raim        |b|As in CNB
|269-269  | 1  |Virtual-aid flag       |virtual_aid |b|See Below
|270-270  | 1  |Assigned-mode flag     |assigned    |b|See <<IALA>> for details
|271-271  | 1  |Spare                  |            |x|Not used
|272-360  |88  |Name Extension         |            |t|See Below
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
  'name',
  'latitude',
  'longitude',
  'posAccuracy',
  'dimToBow',
  'dimToBowStatus',
  'dimToStern',
  'dimToSternStatus',
  'dimToPort',
  'dimToPortStatus',
  'dimToStbrd',
  'dimToStbrdStatus',
  'length',
  'width',
  'epfd',
  'epfdStr',
  'utcTsSec',
  'utcTsStatus',
  'offPosInd',
  'aidType',
  'aidTypeStr',
  'nameExt'
 ];

 let suppValuesValid = false;
 let suppValues : SuppValues = {};

export default class Ais21Msg extends AisMessage {
  constructor(aisType : number,bitField : AisBitField, channel : string) {
    super(aisType,bitField,channel);
    if(bitField.bits >= 271) {
      this._valid = 'VALID';
    } else {
      this._valid = 'INVALID';
      this._errMsg = 'invalid bitcount for type 21 msg:' + bitField.bits;
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

  // |38-42    | 5  |Aid type               |aid_type    |e|See "Navaid Types"
  get aidType() : number {
    return this._bitField.getInt(38,5,true);
  }

  //  |43-162  1|120 |Name                   |name        |t|Name in sixbit chars
  get name() : string {
    return this._formatStr(this._bitField.getString(43,162));
  }

  // |163-163  | 1  |Position Accuracy      |accuracy    |b|As in CNB
  get posAccuracy() : boolean {
    return this._bitField.getInt(163, 1, true) === 1;
  }

  // |164-191  |28  |Longitude              |lon         |I4|Minutes/10000 (as in CNB)
  _getRawLon() : number {
    return this._bitField.getInt(164,28,false);
  }

  //|192-218  |27  |Latitude               |lat         |I4|Minutes/10000 (as in CNB)
  _getRawLat() : number {
    return this._bitField.getInt(192,27,false);
  }

  // |219-227  | 9  |Dimension to Bow       |to_bow      |u|Meters
  _getDimToBow() : number {
    return this._bitField.getInt(219,9,true);
  }

  // |228-236  | 9  |Dimension to Stern     |to_stern    |u|Meters
  _getDimToStern() : number {
    return this._bitField.getInt(228,9,true);
  }

  // |237-242  | 6  |Dimension to Port      |to_port     |u|Meters
  _getDimToPort() : number {
    return this._bitField.getInt(237,6,true);
  }

  // |243-248  | 6  |Dimension to Starboard |to_starboard|u|Meters
  _getDimToStbrd() : number {
    return this._bitField.getInt(243,6,true);
  }

  // |249-252  | 4  |Type of EPFD           |epfd        |e|As in Message Type 4
  get epfd() : number {
    return this._bitField.getInt(249,4,true);
  }

  // |253-258  | 6  |UTC Second             |second      |u|As in Message Type 5
  _getUtcSec() : number {
    return this._bitField.getInt(253,6,true);
  }

  // |259-259  | 1  |Off-Position Indicator |off_position|b|See Below
  get offPosInd() : 'IN_POS' | 'OFF_POS' | 'NA' {
    if(this._getUtcSec() < 60) {
      return (this._bitField.getInt(163, 1, true) === 0) ? 'IN_POS' : 'OFF_POS';
    } else {
      return 'NA';
    }
  }

  // |272-360  |88  |Name Extension         |            |t|See Below
  get nameExt() : string {
    if(this._bitField.bits > 272) {
      let chars : number = Math.floor((this._bitField.bits - 272) / 6);
      if(chars > 0) {
        return this._formatStr(this._bitField.getString(272,chars * 6));
      }
    }
  return '';
  }
}
