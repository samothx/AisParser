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

export type UtcTsStatus = 'VALID' | 'INVALID' | 'NA' | 'MANUAL' | 'ESTIMATED' | 'INOPERATIVE';
export type RotStatus = 'NONE' | 'RIGHT' | 'LEFT' | 'NA';
export type SogStatus = 'HIGH' | 'VALID' | 'INVALID' | 'NA';
export type SuppValues = { [key : string] : string };

export type Validity = 'VALID' | 'INCOMPLETE' | 'INVALID' | 'UNSUPPORTED';

export type ROT = {
  type : 'RIGHT' | 'LEFT' | 'NONE' | 'INVALID';
  speed : number;
}

const DEBUG = false;
const MOD_NAME = 'AisMessage';
const INVALID_LON = 0x6791AC0;
const INVALID_LAT = 0x3412140;

const SUPPORTED_FIELDS = [
  'valid',
  'errMsg',
  'aisType' ];

const NAV_STATUS = {
  '0' : 'Under way using engine',
  '1' : 'At anchor',
  '2' : 'Not under command',
  '3' : 'Restricted manoeuverability',
  '4' : 'Constrained by her draught',
  '5' : 'Moored',
  '6' : 'Aground',
  '7' : 'Engaged in Fishing',
  '8' : 'Under way sailing',
  '9' : 'Reserved for future amendment of Navigational Status for HSC',
  '10' : 'Reserved for future amendment of Navigational Status for WIG',
  '11' : 'Reserved for future use',
  '12' : 'Reserved for future use',
  '13' : 'Reserved for future use',
  '14' : 'Reserved for future use',
  '15' : 'Not defined (default)',
}

const SHIP_TYPE = {
  '0'  : 'Not available',
  '1'  : 'Reserved for future use',
  '2'  : 'Reserved for future use',
  '3'  : 'Reserved for future use',
  '4'  : 'Reserved for future use',
  '5'  : 'Reserved for future use',
  '6'  : 'Reserved for future use',
  '7'  : 'Reserved for future use',
  '8'  : 'Reserved for future use',
  '9'  : 'Reserved for future use',
  '10' : 'Reserved for future use',
  '11' : 'Reserved for future use',
  '12' : 'Reserved for future use',
  '13' : 'Reserved for future use',
  '14' : 'Reserved for future use',
  '15' : 'Reserved for future use',
  '16' : 'Reserved for future use',
  '17' : 'Reserved for future use',
  '18' : 'Reserved for future use',
  '19' : 'Reserved for future use',
  '20' : '|Wing in ground (WIG), all ships of this type',
  '21' : 'Wing in ground (WIG), Hazardous category A',
  '22' : 'Wing in ground (WIG), Hazardous category B',
  '23' : 'Wing in ground (WIG), Hazardous category C',
  '24' : 'Wing in ground (WIG), Hazardous category D',
  '25' : 'Wing in ground (WIG), Reserved for future use',
  '26' : 'Wing in ground (WIG), Reserved for future use',
  '27' : 'Wing in ground (WIG), Reserved for future use',
  '28' : 'Wing in ground (WIG), Reserved for future use',
  '29' : 'Wing in ground (WIG), Reserved for future use',
  '30' : 'Fishing',
  '31' : 'Towing',
  '32' : 'Towing: length exceeds 200m or breadth exceeds 25m',
  '33' : 'Dredging or underwater ops',
  '34' : 'Diving ops',
  '35' : 'Military ops',
  '36' : 'Sailing',
  '37' : 'Pleasure Craft',
  '38' : 'Reserved',
  '39' : 'Reserved',
  '40' : 'High speed craft (HSC), all ships of this type',
  '41' : 'High speed craft (HSC), Hazardous category A',
  '42' : 'High speed craft (HSC), Hazardous category B',
  '43' : 'High speed craft (HSC), Hazardous category C',
  '44' : 'High speed craft (HSC), Hazardous category D',
  '45' : 'High speed craft (HSC), Reserved for future use',
  '46' : 'High speed craft (HSC), Reserved for future use',
  '47' : 'High speed craft (HSC), Reserved for future use',
  '48' : 'High speed craft (HSC), Reserved for future use',
  '49' : 'High speed craft (HSC), No additional information',
  '50' : 'Pilot Vessel',
  '51' : 'Search and Rescue vessel',
  '52' : 'Tug',
  '53' : 'Port Tender',
  '54' : 'Anti-pollution equipment',
  '55' : 'Law Enforcement',
  '56' : 'Spare - Local Vessel',
  '57' : 'Spare - Local Vessel',
  '58' : 'Medical Transport',
  '59' : 'Noncombatant ship according to RR Resolution No. 18',
  '60' : 'Passenger, all ships of this type',
  '61' : 'Passenger, Hazardous category A',
  '62' : 'Passenger, Hazardous category B',
  '63' : 'Passenger, Hazardous category C',
  '64' : 'Passenger, Hazardous category D',
  '65' : 'Passenger, Reserved for future use',
  '66' : 'Passenger, Reserved for future use',
  '67' : 'Passenger, Reserved for future use',
  '68' : 'Passenger, Reserved for future use',
  '69' : 'Passenger, No additional information',
  '70' : 'Cargo, all ships of this type',
  '71' : 'Cargo, Hazardous category A',
  '72' : 'Cargo, Hazardous category B',
  '73' : 'Cargo, Hazardous category C',
  '74' : 'Cargo, Hazardous category D',
  '75' : 'Cargo, Reserved for future use',
  '76' : 'Cargo, Reserved for future use',
  '77' : 'Cargo, Reserved for future use',
  '78' : 'Cargo, Reserved for future use',
  '79' : 'Cargo, No additional information',
  '80' : 'Tanker, all ships of this type',
  '81' : 'Tanker, Hazardous category A',
  '82' : 'Tanker, Hazardous category B',
  '83' : 'Tanker, Hazardous category C',
  '84' : 'Tanker, Hazardous category D',
  '85' : 'Tanker, Reserved for future use',
  '86' : 'Tanker, Reserved for future use',
  '87' : 'Tanker, Reserved for future use',
  '88' : 'Tanker, Reserved for future use',
  '89' : 'Tanker, No additional information',
  '90' : 'Other Type, all ships of this type',
  '91' : 'Other Type, Hazardous category A',
  '92' : 'Other Type, Hazardous category B',
  '93' : 'Other Type, Hazardous category C',
  '94' : 'Other Type, Hazardous category D',
  '95' : 'Other Type, Reserved for future use',
  '96' : 'Other Type, Reserved for future use',
  '97' : 'Other Type, Reserved for future use',
  '98' : 'Other Type, Reserved for future use',
  '99' : 'Other Type, no additional information',
}

const AID_TO_NAV = {
  '0' : 'Default, Type of Aid to Navigation not specified',
  '1' : 'Reference point',
  '2' : 'RACON (radar transponder marking a navigation hazard)',
  '3' : 'Fixed structure off shore, such as oil platforms, wind farms,rigs. (Note: This code should identify an obstruction that is fitted with an Aid-to-Navigation AIS station.)',
  '4' : 'Spare, Reserved for future use.',
  '5' : 'Light, without sectors',
  '6' : 'Light, with sectors',
  '7' : 'Leading Light Front',
  '8' : 'Leading Light Rear',
  '9' : 'Beacon, Cardinal N',
  '10 ' : 'Beacon, Cardinal E',
  '11' : 'Beacon, Cardinal S',
  '12' : 'Beacon, Cardinal W',
  '13' : 'Beacon, Port hand',
  '14' : 'Beacon, Starboard hand',
  '15' : 'Beacon, Preferred Channel port hand',
  '16' : 'Beacon, Preferred Channel starboard hand',
  '17' : 'Beacon, Isolated danger',
  '18' : 'Beacon, Safe water',
  '19' : 'Beacon, Special mark',
  '20' : 'Cardinal Mark N',
  '21' : 'Cardinal Mark E',
  '22' : 'Cardinal Mark S',
  '23' : 'Cardinal Mark W',
  '24' : 'Port hand Mark',
  '25' : 'Starboard hand Mark',
  '26' : 'Preferred Channel Port hand',
  '27' : 'Preferred Channel Starboard hand',
  '28' : 'Isolated danger',
  '29' : 'Safe Water',
  '30' : 'Special Mark',
  '31' : 'Light Vessel / LANBY / Rigs' };

const EPFD = {
  '0' : 'Undefined',
  '1' : 'GPS',
  '2' : 'GLONASS',
  '3' : 'Combined GPS/GLONASS',
  '4' : 'Loran-C',
  '5' : 'Chayka',
  '6' : 'Integrated navigation system',
  '7' : 'Surveyed',
  '8' : 'Galileo'
}

const UNITS = {
  'aisType'           : 'number',
  'channel'           : 'string',
  'repeatInd'         : 'number',
  'mmsi'              : 'number',
  'class'             : 'string',
  'latitude'          : 'deg',
  'longitude'         : 'deg',
  'posAccuracy'       : 'boolean',
  'navStatus'         : 'index',
  'navStatusStr'      : 'string',
  'utcYear'           : 'year',
  'utcMonth'          : 'month',
  'utcDay'            : 'day',
  'utcHour'           : 'hour',
  'utcMinute'         : 'min',
  'utcSecond'         : 's',
  'epfd'              : 'index',
  'epfdStr'           : 'string',
  'callSign'          : 'string',
  'name'              : 'string',
  'aisVer'            : 'number',
  'imo'               : 'number',
  'shipType'          : 'index',
  'shipTypeStr'       : 'string',
  'dimToBow'          : 'm',
  'dimToStern'        : 'm',
  'dimToPort'         : 'm',
  'dimToStbrd'        : 'm',
  'length'            : 'm',
  'width'             : 'm',
  'etaMonth'          : 'month',
  'etaDay'            : 'day',
  'etaHour'           : 'h',
  'etaMinute'         : 'min',
  'draught'           : 'm',
  'destination'       : 'string',
  'heading'           : 'deg',
  'sogStatus'         : 'string',
  'sog'               : 'kn',
  'cog'               : 'deg',
  'latitude'          : 'deg',
  'longitude'         : 'deg',
  'utcTsSec'          : 's',
  'utcTsStatus'         : 'string',
  'partNo'            : 'number',
  'vendorId'          : 'string',
  'mothershipMmsi'    : 'string',
  'rotStatus'         : 'string',
  'rot'               : 'deg/min',
  'offPosInd'         : 'string',
  'aidType'           : 'index',
  'aidTypeStr'        : 'string',
  'nameExt'           : 'string'
 }

let suppValuesValid = false;
let suppValues : SuppValues = {};

export default class AisMessage {
  _valid : Validity;
  _errMsg : string;
  _bitField : AisBitField;
  _aisType : number;
  _mmsi : ?number;
  _channel : string;
  _utcSec : ?number;
  _rot : ?number;
  _sog : ?number;
  _cog : ?number;
  _lat : ?number;
  _lon : ?number;
  _hdg : ?number;

  static fromError(valid : Validity,errMsg : string,aisType : number = 0,channel : string = '') : AisMessage {
    let msg = new AisMessage(aisType,new AisBitField('',0),channel);
    msg.setResult(valid, errMsg);
    return msg;
  }

  static getUnit(field : string) : ?string {
    return UNITS[field];
  }

  getUnit(field : string) : ?string {
    return UNITS[field];
  }

  constructor(aisType : number,bitField : AisBitField, channel : string) {
    this._aisType = aisType;
    this._bitField = bitField;
    this._channel = channel;
    this._valid = 'INVALID';
    this._errMsg = ''
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

  setResult(valid : Validity,errMsg : string) : void {
    this._valid = valid;
    this._errMsg = errMsg;
  }

  _formatStr(str : string) : string {
    let end = str.indexOf('@');
    if(end > -1) {
      return str.substr(0,end);
    } else {
      return str;
    }
  }

  get valid() : Validity {
    return this._valid;
  }

  get errMsg() : string {
    return this._errMsg;
  }

  get aisType() : number {
    return this._aisType;
  }

  get channel() : string {
    return this._channel;
  }

  get class() : string {
    return '';
  }

  get repeatInd() : number {
    if(this._bitField && (this._bitField.bits >= 8)) {
      return this._bitField.getInt(6,2,true);
    } else {
      return NaN;
    }
  }

  _getMmsi() : number {
    if(this._bitField && (this._bitField.bits >= 38)) {
      return this._bitField.getInt(8,30,true);
    } else {
      return NaN;
    }
  }

  get mmsi() : number {
    if(typeof this._mmsi !== 'number') {
      this._mmsi = this._getMmsi();
    }
    return this._mmsi;
  }

  get aisVer() : number {
    return NaN;
  }

  get imo() : number {
    return NaN;
  }

  get navStatus() : number {
    return NaN;
  }

  get navStatusStr() : string {
    return NAV_STATUS[String(this.navStatus)] || '';
  }

  _getRawRot() : number  {
    return 128;
  }

  get rotStatus() : RotStatus {
    if(typeof this._rot !== 'number') {
      this._rot = this._getRawRot();
    }
    let rot : number = this._rot;
    if(rot === 128) {
      return 'NA';
    }

    if(rot === 0) {
      return 'NONE';
    }

    return (rot > 0) ? 'RIGHT' : 'LEFT';
  }

  get rot() : number {
    if(typeof this._rot !== 'number') {
      this._rot = this._getRawRot();
    }
    let rot : number = this._rot;
    if(Math.abs(rot) < 127) {
      return Math.pow(rot / 4.733,2) * Math.sign(rot) ;
    } else {
      return NaN;
    }
  }

  _getRawHeading() : number {
    return 511;
  }

  get heading() : number {
    if(typeof this._hdg !== 'number') {
      this._hdg = this._getRawHeading();
    }
    return (this._hdg === 511) ? NaN : this._hdg;
  }

  _getRawSog() : number {
    return 1023;
  }

  get sogStatus() : SogStatus {
    if(typeof this._sog !== 'number') {
      this._sog = this._getRawSog();
    }
    let sog : number = this._sog;
    if(sog < 1022) return 'VALID';
    if(sog === 1022) return 'HIGH';
    if(sog === 1023) return 'NA';
    return 'INVALID';
  }

  get sog() : number {
    if(typeof this._sog !== 'number') {
      this._sog = this._getRawSog();
    }
    let sog : number = this._sog;
    if(sog > 1021) {
      return NaN
    } else {
      return (sog / 10);
    }
  }

  _getRawCog() : number {
    return 3600;
  }

  get cog() : number {
    if(typeof this._cog !== 'number') {
      this._cog = this._getRawCog();
    }

  return (this._cog !== 3600) ? (this._cog /  10) : NaN;
  }

  _getRawLat() : number {
    return INVALID_LAT;
  }

  get latitude() : number {
    if(typeof this._lat !== 'number') {
      this._lat = this._getRawLat();
    }
    let lat : number = this._lat;
    return (lat === INVALID_LAT) ? NaN : lat / 600000;
  }

  _getRawLon() : number {
    return INVALID_LON;
  }

  get longitude() : number {
    if(typeof this._lon !== 'number') {
      this._lon = this._getRawLon();
    }
    let lon : number = this._lon;
    return (lon === INVALID_LON) ? NaN : lon / 600000;
  }

  get posAccuracy() : boolean {
    return false;
  }

  get callSign() : string {
    return '';
  }

  get name() : string {
    return '';
  }

  _getUtcSec() : number {
    return 60;
  }

  get utcTsSec() : number {
    if(!(typeof this._utcSec === 'number')) {
      this._utcSec = this._getUtcSec();
    }
    return (this._utcSec < 60) ? this._utcSec : NaN;
  }

  get utcTsStatus() : UtcTsStatus {
    if(!(typeof this._utcSec === 'number')) {
      this._utcSec = this._getUtcSec();
    }
    if(this._utcSec < 60) {
      return 'VALID';
    } else {
      /* 60 if time stamp is not available (default)
       * 61 if positioning system is in manual input mode
       * 62 if Electronic Position Fixing System operates in estimated (dead
            reckoning) mode,
       * 63 if the positioning system is inoperative.
       */
      switch(this._utcSec) {
        case 60:
          return 'NA';
        case 61:
          return 'MANUAL';
        case 62:
          return 'ESTIMATED';
        case 63:
          return 'INOPERATIVE';
        default:
          return 'INVALID';
      }
    }
  }

  get shipType() : number {
    return 0;
  }

  get shipTypeStr() : string {
    return SHIP_TYPE[this.shipType] || '';
  }

  get dimToBow() : number {
    return NaN;
  }

  get dimToStern() : number {
    return NaN;
  }

  get dimToPort() : number {
    return NaN;
  }

  get dimToStbrd() : number {
    return NaN;
  }

  get length() : number {
    let dimToBow : number = this.dimToBow;
    let dimToStern : number = this.dimToStern;
    if(isNaN(dimToBow) || isNaN(dimToStern)) {
      return NaN;
    } else {
      return  dimToBow + dimToStern;
    }
  }

  get width() : number {
    let dimToPort : number = this.dimToPort;
    let dimToStbrd : number = this.dimToStbrd;
    if(isNaN(dimToPort) || isNaN(dimToStbrd)) {
      return NaN;
    } else {
      return  dimToPort + dimToStbrd;
    }
  }

  get epfd() : number {
    return 0;
  }

  get epfdStr() : string {
    return EPFD[this.epfd.toString()] || '';
  }

  get etaMonth() : number {
    return NaN;
  }

  get etaDay() : number {
    return NaN;
  }

  get etaHour() : number {
    return NaN;
  }

  get etaMinute() : number {
    return NaN;
  }

  get draught() : number {
    return NaN;
  }

  get destination() : string {
    return '';
  }

  get partNo() : number {
    return NaN;
  }

  get vendorId() : string {
    return '';
  }

  // Type 4 Message
  get utcYear() : number {
    return NaN;
  }

  get utcMonth() : number {
    return NaN;
  }

  get utcDay() : number {
    return NaN;
  }

  get utcHour() : number {
    return NaN;
  }

  get utcMinute() : number {
    return NaN;
  }

  get utcSecond() : number {
    return NaN;
  }

  get aidType() : number {
    return NaN;
  }

  get aidTypeStr() : string {
    return AID_TO_NAV[this.aidType.toString()] || '';
  }

  get nameExt() : string {
    return '';
  }

  get offPosInd() : 'IN_POS' | 'OFF_POS' | 'NA' {
    return 'NA';
  }


}
