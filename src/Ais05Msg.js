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

const MOD_NAME = 'Ais05Msg';
const SUPPORTED_FIELDS = [
  'aisType',
  'channel',
  'repeatInd',
  'mmsi',
  'midCountry',
  'midCountryIso',
  'mmsiType',
  'callSign',
  'name',
  'aisVer',
  'imo',
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
  'epfdStr',
  'etaMonth',
  'etaDay',
  'etaHour',
  'etaMinute',
  'draught',
  'destination',
];

let suppValuesValid = false;
let suppValues : SuppValues = {};


/*
|==============================================================================
|Field   |Len |Description            |Member/Type  |T|Encoding
|0-5     |  6 |Message Type           |type         |u|Constant: 5
|6-7     |  2 |Repeat Indicator       |repeat       |u|Message repeat count
|8-37    | 30 |MMSI                   |mmsi         |u|9 digits
|38-39   |  2 |AIS Version            |ais_version  |u|0=<<ITU1371>>,
                                                       1-3 = future editions
|40-69   | 30 |IMO Number             |imo          |u|IMO ship ID number
|70-111  | 42 |Call Sign              |callsign     |t|7 six-bit characters
|112-231 |120 |Vessel Name            |shipname     |t|20 six-bit characters
|232-239 |  8 |Ship Type              |shiptype     |e|See "Codes for Ship Type"
|240-248 |  9 |Dimension to Bow       |to_bow       |u|Meters
|249-257 |  9 |Dimension to Stern     |to_stern     |u|Meters
|258-263 |  6 |Dimension to Port      |to_port      |u|Meters
|264-269 |  6 |Dimension to Starboard |to_starboard |u|Meters
|270-273 |  4 |Position Fix Type      |epfd         |e|See "EPFD Fix Types"
|274-277 |  4 |ETA month (UTC)        |month        |u|1-12, 0=N/A (default)
|278-282 |  5 |ETA day (UTC)          |day          |u|1-31, 0=N/A (default)
|283-287 |  5 |ETA hour (UTC)         |hour         |u|0-23, 24=N/A (default)
|288-293 |  6 |ETA minute (UTC)       |minute       |u|0-59, 60=N/A (default)
|294-301 |  8 |Draught                |draught      |U1|Meters/10
|302-421 |120 |Destination            |destination  |t|20 6-bit characters
TODO:
|422-422 |  1 |DTE                    |dte          |b|0=Data terminal ready,
                                                       1=Not ready (default).
|423-423 |  1 |Spare                  |             |x|Not used
|==============================================================================
*/

export default class Ais05Msg extends AisMessage {
  constructor(aisType : number,bitField : AisBitField, channel : string) {
    super(aisType,bitField,channel);
    if(bitField.bits >= 423) {
      this._valid = 'VALID';
    } else {
      this._valid = 'INVALID';
      this._errMsg = 'invalid bitcount for type 05 msg:' + bitField.bits;
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

  get callSign() : string {
    return this._formatStr(this._bitField.getString(70,42));
  }

  get name() : string {
    return this._formatStr(this._bitField.getString(112,120));
  }

  get aisVer() : number {
    return this._bitField.getInt(38,2,true);
  }

  get imo() : number {
    return this._bitField.getInt(40,30,true);
  }

  get shipType() : number {
    return this._bitField.getInt(232,8,true);
  }

  _getDimToBow() : number {
    return this._bitField.getInt(240,9,true);
  }

  _getDimToStern() : number {
    return this._bitField.getInt(249,9,true);
  }

  _getDimToPort() : number {
    return this._bitField.getInt(258,6,true);
  }

  _getDimToStbrd() : number {
    return this._bitField.getInt(264,6,true);
  }

  get epfd() : number {
    return this._bitField.getInt(270,4,true);
  }

  get etaMonth() : number {
    return this._bitField.getInt(274,4,true) || NaN;
  }

  get etaDay() : number {
    return this._bitField.getInt(278,5,true) || NaN;
  }

  get etaHour() : number {
    return this._bitField.getInt(273,5,true) || NaN;
  }

  get etaMinute() : number {
    return this._bitField.getInt(288,6,true) || NaN;
  }

  get draught() : number {
    return this._bitField.getInt(294,8,true) / 10;
  }

  get destination() : string {
    return this._formatStr(this._bitField.getString(302,120));
  }
}
